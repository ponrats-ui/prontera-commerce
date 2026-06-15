import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedUser } from "../auth/auth.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CustomerAddressService } from "./customer-address.service";
import { CustomersService } from "./customers.service";
import {
  CreateCustomerAddressDto,
  CreateCustomerDto,
  CreateCustomerGroupDto,
  CreateCustomerNoteDto,
  CreateCustomerTagDto,
  UpdateCustomerAddressDto,
  UpdateCustomerDto,
  UpdateCustomerGroupDto,
  UpdateCustomerLoyaltyDto,
  UpdateCustomerTagDto,
} from "./dto/customer.dto";

@ApiTags("Customers")
@ApiBearerAuth()
@Roles("admin", "merchant")
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly addressService: CustomerAddressService,
  ) {}

  @Post("shops/:shopId/customers")
  @ApiOperation({ summary: "Create a shop customer" })
  @ApiBody({ type: CreateCustomerDto })
  createCustomer(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
    @Body() dto: CreateCustomerDto,
  ) {
    return this.customersService.createCustomer(user, shopId, dto);
  }

  @Get("shops/:shopId/customers")
  @ApiOperation({ summary: "List shop customers" })
  listCustomers(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.customersService.listCustomers(user, shopId);
  }

  @Get("customers/:id")
  @ApiOperation({ summary: "Get a customer profile" })
  getCustomer(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.getCustomer(user, id);
  }

  @Patch("customers/:id")
  @ApiOperation({ summary: "Update a customer profile" })
  @ApiBody({ type: UpdateCustomerDto })
  updateCustomer(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.updateCustomer(user, id, dto);
  }

  @Delete("customers/:id")
  @ApiOperation({ summary: "Soft delete a customer profile" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteCustomer(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.customersService.deleteCustomer(user, id);
  }

  @Post("customers/:id/addresses")
  @ApiOperation({ summary: "Add a customer address" })
  @ApiBody({ type: CreateCustomerAddressDto })
  addAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CreateCustomerAddressDto,
  ) {
    return this.addressService.addAddress(user, id, dto);
  }

  @Get("customers/:id/addresses")
  @ApiOperation({ summary: "List customer addresses" })
  listAddresses(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.addressService.listAddresses(user, id);
  }

  @Patch("customers/:id/addresses/:addressId")
  @ApiOperation({ summary: "Update a customer address" })
  @ApiBody({ type: UpdateCustomerAddressDto })
  updateAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("addressId") addressId: string,
    @Body() dto: UpdateCustomerAddressDto,
  ) {
    return this.addressService.updateAddress(user, id, addressId, dto);
  }

  @Delete("customers/:id/addresses/:addressId")
  @ApiOperation({ summary: "Soft delete a customer address" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteAddress(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("addressId") addressId: string,
  ) {
    return this.addressService.deleteAddress(user, id, addressId);
  }

  @Post("customers/:id/notes")
  @ApiOperation({ summary: "Add a customer note" })
  @ApiBody({ type: CreateCustomerNoteDto })
  addNote(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: CreateCustomerNoteDto,
  ) {
    return this.customersService.addNote(user, id, dto);
  }

  @Get("customers/:id/notes")
  @ApiOperation({ summary: "List customer notes" })
  listNotes(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.listNotes(user, id);
  }

  @Post("shops/:shopId/customer-groups")
  @ApiOperation({ summary: "Create a customer group" })
  @ApiBody({ type: CreateCustomerGroupDto })
  createGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
    @Body() dto: CreateCustomerGroupDto,
  ) {
    return this.customersService.createGroup(user, shopId, dto);
  }

  @Get("shops/:shopId/customer-groups")
  @ApiOperation({ summary: "List customer groups" })
  listGroups(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.customersService.listGroups(user, shopId);
  }

  @Patch("customer-groups/:id")
  @ApiOperation({ summary: "Update a customer group" })
  @ApiBody({ type: UpdateCustomerGroupDto })
  updateGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerGroupDto,
  ) {
    return this.customersService.updateGroup(user, id, dto);
  }

  @Delete("customer-groups/:id")
  @ApiOperation({ summary: "Soft delete a customer group" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteGroup(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.deleteGroup(user, id);
  }

  @Post("customers/:id/groups/:groupId")
  @ApiOperation({ summary: "Assign a customer group" })
  assignGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("groupId") groupId: string,
  ) {
    return this.customersService.assignGroup(user, id, groupId);
  }

  @Delete("customers/:id/groups/:groupId")
  @ApiOperation({ summary: "Remove a customer group assignment" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  removeGroup(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("groupId") groupId: string,
  ) {
    return this.customersService.removeGroup(user, id, groupId);
  }

  @Post("shops/:shopId/customer-tags")
  @ApiOperation({ summary: "Create a customer tag" })
  @ApiBody({ type: CreateCustomerTagDto })
  createTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
    @Body() dto: CreateCustomerTagDto,
  ) {
    return this.customersService.createTag(user, shopId, dto);
  }

  @Get("shops/:shopId/customer-tags")
  @ApiOperation({ summary: "List customer tags" })
  listTags(
    @CurrentUser() user: AuthenticatedUser,
    @Param("shopId") shopId: string,
  ) {
    return this.customersService.listTags(user, shopId);
  }

  @Patch("customer-tags/:id")
  @ApiOperation({ summary: "Update a customer tag" })
  @ApiBody({ type: UpdateCustomerTagDto })
  updateTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerTagDto,
  ) {
    return this.customersService.updateTag(user, id, dto);
  }

  @Delete("customer-tags/:id")
  @ApiOperation({ summary: "Soft delete a customer tag" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  deleteTag(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.deleteTag(user, id);
  }

  @Post("customers/:id/tags/:tagId")
  @ApiOperation({ summary: "Assign a customer tag" })
  assignTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("tagId") tagId: string,
  ) {
    return this.customersService.assignTag(user, id, tagId);
  }

  @Delete("customers/:id/tags/:tagId")
  @ApiOperation({ summary: "Remove a customer tag assignment" })
  @ApiOkResponse({ schema: { example: { success: true } } })
  removeTag(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Param("tagId") tagId: string,
  ) {
    return this.customersService.removeTag(user, id, tagId);
  }

  @Get("customers/:id/activity")
  @ApiOperation({ summary: "List customer activity" })
  listActivity(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
  ) {
    return this.customersService.listActivity(user, id);
  }

  @Get("customers/:id/loyalty")
  @ApiOperation({ summary: "Get customer loyalty account" })
  getLoyalty(@CurrentUser() user: AuthenticatedUser, @Param("id") id: string) {
    return this.customersService.getLoyalty(user, id);
  }

  @Patch("customers/:id/loyalty")
  @ApiOperation({ summary: "Update customer loyalty account" })
  @ApiBody({ type: UpdateCustomerLoyaltyDto })
  updateLoyalty(
    @CurrentUser() user: AuthenticatedUser,
    @Param("id") id: string,
    @Body() dto: UpdateCustomerLoyaltyDto,
  ) {
    return this.customersService.updateLoyalty(user, id, dto);
  }
}
