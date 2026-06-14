import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/auth.module";
import { GlobalCommerceModule } from "./global-commerce/global-commerce.module";

@Module({
  imports: [AuthModule, GlobalCommerceModule],
})
export class AppModule {}
