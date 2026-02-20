import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocEmpleado } from './entities/doc-empleado.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { TipoDoc } from '../tipo-doc/entities/tipo-doc.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocEmpleadoService {
  constructor(
    @InjectRepository(DocEmpleado)
    private docEmpleadoRepository: Repository<DocEmpleado>,
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    @InjectRepository(TipoDoc)
    private tipoDocRepository: Repository<TipoDoc>,
  ) { }

  async uploadDocumento(
    id_empleado: number,
    id_tipo_doc: number,
    file: Express.Multer.File
  ): Promise<DocEmpleado> {
    // Verificar que el empleado existe
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado }
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
    }

    // Verificar que el tipo de documento existe
    const tipoDoc = await this.tipoDocRepository.findOne({
      where: { id_tipo_doc }
    });

    if (!tipoDoc) {
      throw new NotFoundException(`Tipo de documento con ID ${id_tipo_doc} no encontrado`);
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no debe exceder 10MB');
    }

    // Buscar si existe un documento activo de este tipo para este empleado
    const docActivo = await this.docEmpleadoRepository.findOne({
      where: {
        id_empleado,
        id_tipo_doc,
        activo: true
      }
    });

    let nuevaVersion = 1;

    // Si existe documento activo, desactivarlo (guardar en historial)
    if (docActivo) {
      docActivo.activo = false;
      await this.docEmpleadoRepository.save(docActivo);
      nuevaVersion = docActivo.version + 1;
    }

    // Crear directorio si no existe
    const uploadPath = path.join('uploads', 'documentos', String(id_empleado));
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    const fileName = `doc_${id_tipo_doc}_v${nuevaVersion}_${timestamp}${extension}`;
    const filePath = path.join(uploadPath, fileName);

    // Guardar archivo
    fs.writeFileSync(filePath, file.buffer);

    // Crear nuevo registro ACTIVO
    const nuevoDoc = this.docEmpleadoRepository.create({
      id_empleado,
      id_tipo_doc,
      nombre_archivo: file.originalname,
      ruta_archivo: filePath,
      activo: true,
      version: nuevaVersion
    });

    return await this.docEmpleadoRepository.save(nuevoDoc);
  }

  async getListadoDocumentos(id_empleado: number) {
    // Verificar que el empleado existe
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado }
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
    }

    // Obtener todos los tipos de documentos activos
    const tiposDoc = await this.tipoDocRepository.find({
      where: { activo: true },
      order: { orden: 'ASC' }
    });

    // Obtener solo documentos ACTIVOS del empleado
    const docsActivos = await this.docEmpleadoRepository.find({
      where: {
        id_empleado,
        activo: true  // Solo documentos activos
      },
      relations: ['tipoDoc']
    });

    // Crear mapa de documentos activos
    const docsMap = new Map();
    docsActivos.forEach(doc => {
      docsMap.set(doc.id_tipo_doc, doc);
    });

    // Crear listado completo
    const listado = tiposDoc.map(tipoDoc => {
      const docActivo = docsMap.get(tipoDoc.id_tipo_doc);

      return {
        id_tipo_doc: tipoDoc.id_tipo_doc,
        nombre_doc: tipoDoc.nombre_doc,
        descripcion: tipoDoc.descripcion,
        obligatorio: tipoDoc.obligatorio,
        orden: tipoDoc.orden,
        subido: !!docActivo,
        documento: docActivo ? {
          id_doc_empleado: docActivo.id_doc_empleado,
          nombre_archivo: docActivo.nombre_archivo,
          fecha_carga: docActivo.fecha_carga,
          version: docActivo.version,
          fecha_actualizacion: docActivo.fecha_actualizacion
        } : null
      };
    });

    // Calcular estadísticas
    const totalDocs = tiposDoc.length;
    const docsObligatorios = tiposDoc.filter(t => t.obligatorio).length;
    const docsSubidosCount = docsActivos.length;
    const docsObligatoriosSubidos = docsActivos.filter(d => d.tipoDoc.obligatorio).length;

    return {
      empleado: {
        id_empleado: empleado.id_empleado,
        nombre: empleado.nombre,
        numero_empleado: empleado.numero_empleado
      },
      estadisticas: {
        total_documentos: totalDocs,
        documentos_obligatorios: docsObligatorios,
        documentos_subidos: docsSubidosCount,
        obligatorios_subidos: docsObligatoriosSubidos,
        obligatorios_pendientes: docsObligatorios - docsObligatoriosSubidos,
        porcentaje_completado: docsObligatorios > 0
          ? Math.round((docsObligatoriosSubidos / docsObligatorios) * 100)
          : 0
      },
      documentos: listado
    };
  }

  async getHistorialDocumento(id_empleado: number, id_tipo_doc: number) {
    // Verificar que el empleado existe
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado }
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id_empleado} no encontrado`);
    }

    // Verificar que el tipo existe
    const tipoDoc = await this.tipoDocRepository.findOne({
      where: { id_tipo_doc }
    });

    if (!tipoDoc) {
      throw new NotFoundException(`Tipo de documento con ID ${id_tipo_doc} no encontrado`);
    }

    // Obtener TODAS las versiones (activas e inactivas)
    const historial = await this.docEmpleadoRepository.find({
      where: {
        id_empleado,
        id_tipo_doc
      },
      order: { version: 'DESC' }  // Más reciente primero
    });

    return {
      tipo_documento: {
        id_tipo_doc: tipoDoc.id_tipo_doc,
        nombre_doc: tipoDoc.nombre_doc,
        descripcion: tipoDoc.descripcion
      },
      total_versiones: historial.length,
      versiones: historial.map(doc => ({
        id_doc_empleado: doc.id_doc_empleado,
        nombre_archivo: doc.nombre_archivo,
        version: doc.version,
        activo: doc.activo,
        fecha_carga: doc.fecha_carga,
        fecha_actualizacion: doc.fecha_actualizacion
      }))
    };
  }

  async findByEmpleado(id_empleado: number): Promise<DocEmpleado[]> {
    // Solo documentos ACTIVOS
    return await this.docEmpleadoRepository.find({
      where: {
        id_empleado,
        activo: true
      },
      relations: ['tipoDoc'],
      order: { fecha_carga: 'DESC' }
    });
  }

  async findOne(id: number): Promise<DocEmpleado> {
    const doc = await this.docEmpleadoRepository.findOne({
      where: { id_doc_empleado: id },
      relations: ['empleado', 'tipoDoc']
    });

    if (!doc) {
      throw new NotFoundException(`Documento con ID ${id} no encontrado`);
    }

    return doc;
  }

  async downloadFile(id: number): Promise<{ buffer: Buffer; filename: string; mimetype: string }> {
    const doc = await this.findOne(id);

    if (!fs.existsSync(doc.ruta_archivo)) {
      throw new NotFoundException('El archivo no existe en el servidor');
    }

    const buffer = fs.readFileSync(doc.ruta_archivo);
    const extension = path.extname(doc.nombre_archivo).toLowerCase();

    let mimetype = 'application/octet-stream';
    if (extension === '.pdf') mimetype = 'application/pdf';
    else if (['.jpg', '.jpeg'].includes(extension)) mimetype = 'image/jpeg';
    else if (extension === '.png') mimetype = 'image/png';

    return {
      buffer,
      filename: doc.nombre_archivo,
      mimetype
    };
  }

  async activarVersion(id: number): Promise<DocEmpleado> {
    const doc = await this.findOne(id);

    // Desactivar cualquier versión activa del mismo tipo y empleado
    const docActivo = await this.docEmpleadoRepository.findOne({
      where: {
        id_empleado: doc.id_empleado,
        id_tipo_doc: doc.id_tipo_doc,
        activo: true
      }
    });

    if (docActivo && docActivo.id_doc_empleado !== id) {
      docActivo.activo = false;
      await this.docEmpleadoRepository.save(docActivo);
    }

    // Activar la versión seleccionada
    doc.activo = true;
    return await this.docEmpleadoRepository.save(doc);
  }

  async remove(id: number): Promise<void> {
    const doc = await this.findOne(id);

    // No permitir eliminar el documento activo si hay otros en historial
    if (doc.activo) {
      const otrasVersiones = await this.docEmpleadoRepository.count({
        where: {
          id_empleado: doc.id_empleado,
          id_tipo_doc: doc.id_tipo_doc,
          activo: false
        }
      });

      if (otrasVersiones > 0) {
        throw new BadRequestException(
          'No se puede eliminar la versión activa mientras existan versiones en el historial. Primero active otra versión.'
        );
      }
    }

    // Eliminar archivo físico
    if (fs.existsSync(doc.ruta_archivo)) {
      fs.unlinkSync(doc.ruta_archivo);
    }

    await this.docEmpleadoRepository.remove(doc);
  }
}