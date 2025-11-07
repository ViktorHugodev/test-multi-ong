import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { OrganizationsRepository } from './organizations.repository';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    // Check for duplicate slug
    const existingBySlug = await this.organizationsRepository.findBySlug(
      createOrganizationDto.slug,
    );
    if (existingBySlug) {
      throw new ConflictException('Organization slug already exists');
    }

    // Check for duplicate email
    const existingByEmail = await this.organizationsRepository.findByEmail(
      createOrganizationDto.email,
    );
    if (existingByEmail) {
      throw new ConflictException('Organization email already exists');
    }

    return this.organizationsRepository.create(createOrganizationDto);
  }

  async findAll() {
    return this.organizationsRepository.findAllActive();
  }

  async findOne(id: string) {
    const organization = await this.organizationsRepository.findById(id);
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${id} not found`);
    }
    return organization;
  }

  async findBySlug(slug: string) {
    const organization = await this.organizationsRepository.findBySlug(slug);
    if (!organization) {
      throw new NotFoundException(`Organization with slug ${slug} not found`);
    }
    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    await this.findOne(id); // Ensure exists

    // If updating slug, check for duplicates
    if (updateOrganizationDto.slug) {
      const existing = await this.organizationsRepository.findBySlug(
        updateOrganizationDto.slug,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Organization slug already exists');
      }
    }

    // If updating email, check for duplicates
    if (updateOrganizationDto.email) {
      const existing = await this.organizationsRepository.findByEmail(
        updateOrganizationDto.email,
      );
      if (existing && existing.id !== id) {
        throw new ConflictException('Organization email already exists');
      }
    }

    return this.organizationsRepository.update(id, updateOrganizationDto);
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists
    return this.organizationsRepository.softDelete(id);
  }
}
