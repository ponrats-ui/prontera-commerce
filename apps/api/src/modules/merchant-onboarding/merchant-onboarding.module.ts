import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DatabaseModule } from "../database/database.module";
import { MerchantOnboardingController } from "./merchant-onboarding.controller";
import { MerchantOnboardingService } from "./merchant-onboarding.service";

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [MerchantOnboardingController],
  providers: [MerchantOnboardingService],
  exports: [MerchantOnboardingService],
})
export class MerchantOnboardingModule {}
