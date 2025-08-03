import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDocumentDto: CreateDocumentDto) {
    return this.prisma.employeeDocument.create({ data: createDocumentDto });
  }

  async findAll() {
    return this.prisma.employeeDocument.findMany();
  }

  async findOne(id: string) {
    return this.prisma.employeeDocument.findUnique({ where: { id } });
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    return this.prisma.employeeDocument.update({
      where: { id },
      data: updateDocumentDto,
    });
  }

  async remove(id: string) {
    return this.prisma.employeeDocument.delete({ where: { id } });
  }
}
