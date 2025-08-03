import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PoliciesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPolicyDto: CreatePolicyDto) {
    return this.prisma.policy.create({ data: createPolicyDto });
  }

  async findAll() {
    return this.prisma.policy.findMany();
  }

  async findOne(id: string) {
    return this.prisma.policy.findUnique({ where: { id } });
  }

  async update(id: string, updatePolicyDto: UpdatePolicyDto) {
    return this.prisma.policy.update({
      where: { id },
      data: updatePolicyDto,
    });
  }

  async remove(id: string) {
    return this.prisma.policy.delete({ where: { id } });
  }
}
