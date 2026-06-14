import { Module } from "@nestjs/common";
import { GlobalCommerceModule } from "./global-commerce/global-commerce.module";

@Module({
  imports: [GlobalCommerceModule],
})
export class AppModule {}
