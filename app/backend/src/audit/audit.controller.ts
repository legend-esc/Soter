import { Controller, Get, Query, Version } from '@nestjs/common';
import { AuditService, AuditQuery } from './audit.service';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

@ApiTags('Audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Version('1')
  @ApiOperation({
    summary: 'Query audit logs',
    description:
      'Retrieves a filtered list of audit logs based on entity, actor, or time range.',
  })
  @ApiOkResponse({ description: 'Audit logs retrieved successfully.' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authentication credentials.',
  })
  @ApiQuery({ name: 'entity', required: false })
  @ApiQuery({ name: 'entityId', required: false })
  @ApiQuery({ name: 'actorId', required: false })
  @ApiQuery({ name: 'startTime', required: false, description: 'ISO string' })
  @ApiQuery({ name: 'endTime', required: false, description: 'ISO string' })
  async getLogs(@Query() query: AuditQuery) {
    return this.auditService.findLogs(query);
  }
}
