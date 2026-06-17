import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { AdminFoundersController } from "./admin-founders.controller";
import { FoundersController } from "./founders.controller";
import { FoundersService } from "./founders.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [FoundersController, AdminFoundersController],
  providers: [FoundersService],
  exports: [FoundersService],
})
export class FoundersModule {}
