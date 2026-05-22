import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { CreateEmpleadoDto } from './dto/create-empleado.dto';
import { UpdateEmpleadoDto } from './dto/update-empleado.dto';
import { EventoService } from '../evento/evento.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class EmpleadoService {
  constructor(
    @InjectRepository(Empleado)
    private empleadoRepository: Repository<Empleado>,
    private eventoService: EventoService,
  ) {}

  private formatDate(value: Date | string | null | undefined): string {
    if (!value) {
      return '';
    }

    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }

    return value;
  }

  private yesNo(value: boolean | null | undefined): string {
    return value ? 'Si' : 'No';
  }

  private styleWorksheet(worksheet: ExcelJS.Worksheet) {
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1F4E78' },
    };

    worksheet.columns.forEach((column) => {
      let maxLength = 12;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        const value = cell.value ? String(cell.value) : '';
        maxLength = Math.max(maxLength, value.length + 2);
      });
      column.width = Math.min(maxLength, 45);
    });
  }

  private async workbookToBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async create(createEmpleadoDto: CreateEmpleadoDto): Promise<Empleado> {
    // Verificar si ya existe empleado con mismo CURP o RFC
    const existente = await this.empleadoRepository.findOne({
      where: [
        { curp: createEmpleadoDto.curp },
        { rfc: createEmpleadoDto.rfc },
        { numero_empleado: createEmpleadoDto.numero_empleado },
        { numero_seguridad_social: createEmpleadoDto.numero_seguridad_social },
      ],
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe un empleado con ese CURP, RFC, número de empleado o NSS',
      );
    }

    // Crear empleado
    const empleado = this.empleadoRepository.create(createEmpleadoDto);
    const empleadoGuardado = await this.empleadoRepository.save(empleado);

    // Crear evento de "Alta en el trabajo" automáticamente
    try {
      await this.eventoService.create({
        id_empleado: empleadoGuardado.id_empleado,
        id_tipo_evento: 4, // ID del tipo "Alta en el trabajo"
        fecha_evento: new Date().toISOString().split('T')[0],
        cargo_nuevo: createEmpleadoDto.puesto,
        salario_nuevo: createEmpleadoDto.salario_actual,
      });
    } catch (error) {
      console.error('Error al crear evento de alta:', error);
    }

    return empleadoGuardado;
  }

  async findAll(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      relations: [
        'categoria',
        'incidencias',
        'documentos',
        'hojaVida',
        'contratos',
      ],
      order: { id_empleado: 'DESC' },
    });
  }

  async findActive(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { activo: true },
      relations: ['categoria'],
      order: { nombre: 'ASC' },
    });
  }

  async findDisctive(): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { activo: false },
      relations: ['categoria'],
      order: { nombre: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado: id },
      relations: [
        'categoria',
        'incidencias',
        'documentos',
        'hojaVida',
        'contratos',
      ],
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    return empleado;
  }

  async update(
    id: number,
    updateEmpleadoDto: UpdateEmpleadoDto,
  ): Promise<Empleado> {
    const empleado = await this.findOne(id);

    // Verificar duplicados si se actualizan campos únicos
    if (
      updateEmpleadoDto.curp ||
      updateEmpleadoDto.rfc ||
      updateEmpleadoDto.numero_empleado ||
      updateEmpleadoDto.numero_seguridad_social
    ) {
      const duplicado = await this.empleadoRepository.findOne({
        where: [
          { curp: updateEmpleadoDto.curp },
          { rfc: updateEmpleadoDto.rfc },
          { numero_empleado: updateEmpleadoDto.numero_empleado },
          {
            numero_seguridad_social: updateEmpleadoDto.numero_seguridad_social,
          },
        ],
      });

      if (duplicado && duplicado.id_empleado !== id) {
        throw new ConflictException('Ya existe un empleado con esos datos');
      }
    }

    Object.assign(empleado, updateEmpleadoDto);
    return await this.empleadoRepository.save(empleado);
  }

  async deactivate(id: number): Promise<Empleado> {
    const empleado = await this.findOne(id);

    //  Primero desactivar el empleado
    empleado.activo = false;
    const empleadoDesactivado = await this.empleadoRepository.save(empleado);

    //  Crear evento de "Baja" automáticamente (ID 5)
    try {
      await this.eventoService.createEventoSinValidacion({
        id_empleado: empleadoDesactivado.id_empleado,
        id_tipo_evento: 5, // ID del tipo "Baja del empleado"
        fecha_evento: new Date().toISOString().split('T')[0],
        cargo_anterior: empleadoDesactivado.puesto,
      });
    } catch (error) {
      console.error('Error al crear evento de baja:', error);
    }

    return empleadoDesactivado;
  }

  async activate(id: number): Promise<Empleado> {
    const empleado = await this.findOne(id);

    //  Primero activar el empleado
    empleado.activo = true;
    const empleadoActivado = await this.empleadoRepository.save(empleado);

    //  Crear evento de "Reintegracion a la universidad" automáticamente (ID 6)
    try {
      await this.eventoService.createEventoSinValidacion({
        id_empleado: empleadoActivado.id_empleado,
        id_tipo_evento: 6, // ID del tipo "Reintegracion a la universidad"
        fecha_evento: new Date().toISOString().split('T')[0],
        cargo_anterior: empleadoActivado.puesto,
      });
    } catch (error) {
      console.error('Error al crear evento de reintegracion:', error);
    }

    return empleadoActivado;
  }

  async remove(id: number): Promise<void> {
    const empleado = await this.findOne(id);
    await this.empleadoRepository.remove(empleado);
  }

  async findByCategoria(id_categoria: number): Promise<Empleado[]> {
    return await this.empleadoRepository.find({
      where: { id_categoria },
      relations: ['categoria'],
    });
  }

  async findByNumeroEmpleado(numero_empleado: number): Promise<Empleado> {
    const empleado = await this.empleadoRepository.findOne({
      where: { numero_empleado },
      relations: ['categoria'],
    });

    if (!empleado) {
      throw new NotFoundException(
        `Empleado con número ${numero_empleado} no encontrado`,
      );
    }

    return empleado;
  }

  async exportAllToExcel(): Promise<Buffer> {
    const empleados = await this.empleadoRepository.find({
      relations: [
        'categoria',
        'incidencias',
        'documentos',
        'contratos',
        'contratos.tipoContrato',
      ],
      order: { nombre: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GestionEM';
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet('Empleados');
    worksheet.columns = [
      { header: 'ID', key: 'id_empleado' },
      { header: 'Numero empleado', key: 'numero_empleado' },
      { header: 'Nombre', key: 'nombre' },
      { header: 'CURP', key: 'curp' },
      { header: 'RFC', key: 'rfc' },
      { header: 'NSS', key: 'numero_seguridad_social' },
      { header: 'Puesto', key: 'puesto' },
      { header: 'Area asignada', key: 'area_asignada' },
      { header: 'Categoria', key: 'categoria' },
      { header: 'Discapacidad', key: 'discapacidad' },
      { header: 'Salario actual', key: 'salario_actual' },
      { header: 'Activo', key: 'activo' },
      { header: 'Fecha creacion', key: 'fecha_creacion' },
      { header: 'Incidencias', key: 'total_incidencias' },
      { header: 'Documentos activos', key: 'documentos_activos' },
      { header: 'Contrato vigente', key: 'contrato_vigente' },
      { header: 'Fin contrato vigente', key: 'fin_contrato_vigente' },
    ];

    empleados.forEach((empleado) => {
      const contratoVigente = empleado.contratos?.find((contrato) => contrato.vigente);

      worksheet.addRow({
        id_empleado: empleado.id_empleado,
        numero_empleado: empleado.numero_empleado,
        nombre: empleado.nombre,
        curp: empleado.curp,
        rfc: empleado.rfc,
        numero_seguridad_social: empleado.numero_seguridad_social || '',
        puesto: empleado.puesto,
        area_asignada: empleado.area_asignada,
        categoria: empleado.categoria?.nombre || '',
        discapacidad: empleado.discapacidad || '',
        salario_actual: empleado.salario_actual || '',
        activo: this.yesNo(empleado.activo),
        fecha_creacion: this.formatDate(empleado.fecha_creacion),
        total_incidencias: empleado.incidencias?.length || 0,
        documentos_activos: empleado.documentos?.filter((documento) => documento.activo).length || 0,
        contrato_vigente: contratoVigente?.tipoContrato?.nombre || '',
        fin_contrato_vigente: this.formatDate(contratoVigente?.fecha_fin),
      });
    });

    this.styleWorksheet(worksheet);

    return this.workbookToBuffer(workbook);
  }

  async exportOneToExcel(id: number): Promise<Buffer> {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado: id },
      relations: [
        'categoria',
        'incidencias',
        'incidencias.tipoIncidencia',
        'documentos',
        'documentos.tipoDoc',
        'contratos',
        'contratos.tipoContrato',
      ],
    });

    if (!empleado) {
      throw new NotFoundException(`Empleado con ID ${id} no encontrado`);
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'GestionEM';
    workbook.created = new Date();

    const datos = workbook.addWorksheet('Datos generales');
    datos.columns = [
      { header: 'Campo', key: 'campo' },
      { header: 'Valor', key: 'valor' },
    ];

    [
      ['ID', empleado.id_empleado],
      ['Numero empleado', empleado.numero_empleado],
      ['Nombre', empleado.nombre],
      ['CURP', empleado.curp],
      ['RFC', empleado.rfc],
      ['NSS', empleado.numero_seguridad_social || ''],
      ['Puesto', empleado.puesto],
      ['Area asignada', empleado.area_asignada],
      ['Categoria', empleado.categoria?.nombre || ''],
      ['Discapacidad', empleado.discapacidad || ''],
      ['Salario actual', empleado.salario_actual || ''],
      ['Activo', this.yesNo(empleado.activo)],
      ['Fecha creacion', this.formatDate(empleado.fecha_creacion)],
    ].forEach(([campo, valor]) => datos.addRow({ campo, valor }));
    this.styleWorksheet(datos);

    const incidencias = workbook.addWorksheet('Incidencias');
    incidencias.columns = [
      { header: 'ID', key: 'id_incidencia' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Fecha inicio', key: 'fecha_inicio' },
      { header: 'Fecha fin', key: 'fecha_fin' },
      { header: 'Observaciones', key: 'observaciones' },
      { header: 'Fecha registro', key: 'fecha_registro' },
    ];

    empleado.incidencias?.forEach((incidencia) => {
      incidencias.addRow({
        id_incidencia: incidencia.id_incidencia,
        tipo: incidencia.tipoIncidencia?.nombre || '',
        fecha_inicio: this.formatDate(incidencia.fecha_inicio),
        fecha_fin: this.formatDate(incidencia.fecha_fin),
        observaciones: incidencia.observaciones || '',
        fecha_registro: this.formatDate(incidencia.fecha_registro),
      });
    });
    this.styleWorksheet(incidencias);

    const contratos = workbook.addWorksheet('Contratos');
    contratos.columns = [
      { header: 'ID', key: 'id_contrato' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Fecha inicio', key: 'fecha_inicio' },
      { header: 'Fecha fin', key: 'fecha_fin' },
      { header: 'Vigente', key: 'vigente' },
      { header: 'Archivo', key: 'archivo' },
      { header: 'Fecha carga', key: 'fecha_carga' },
    ];

    empleado.contratos?.forEach((contrato) => {
      contratos.addRow({
        id_contrato: contrato.id_contrato,
        tipo: contrato.tipoContrato?.nombre || '',
        fecha_inicio: this.formatDate(contrato.fecha_inicio),
        fecha_fin: this.formatDate(contrato.fecha_fin),
        vigente: this.yesNo(contrato.vigente),
        archivo: contrato.nombre_archivo,
        fecha_carga: this.formatDate(contrato.fecha_carga),
      });
    });
    this.styleWorksheet(contratos);

    const documentos = workbook.addWorksheet('Documentos');
    documentos.columns = [
      { header: 'ID', key: 'id_doc_empleado' },
      { header: 'Tipo', key: 'tipo' },
      { header: 'Archivo', key: 'archivo' },
      { header: 'Version', key: 'version' },
      { header: 'Activo', key: 'activo' },
      { header: 'Fecha carga', key: 'fecha_carga' },
      { header: 'Fecha actualizacion', key: 'fecha_actualizacion' },
    ];

    empleado.documentos?.forEach((documento) => {
      documentos.addRow({
        id_doc_empleado: documento.id_doc_empleado,
        tipo: documento.tipoDoc?.nombre_doc || '',
        archivo: documento.nombre_archivo,
        version: documento.version,
        activo: this.yesNo(documento.activo),
        fecha_carga: this.formatDate(documento.fecha_carga),
        fecha_actualizacion: this.formatDate(documento.fecha_actualizacion),
      });
    });
    this.styleWorksheet(documentos);

    return this.workbookToBuffer(workbook);
  }
}
