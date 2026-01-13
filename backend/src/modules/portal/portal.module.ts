import { Module } from '@nestjs/common';
import { PortalController } from './portal.controller';

/**
 * Portal Module
 * Módulo responsável pela Landing Page Pp7ia Portal
 */
@Module({
  controllers: [PortalController],
  providers: [],
  exports: [],
})
export class PortalModule {}
