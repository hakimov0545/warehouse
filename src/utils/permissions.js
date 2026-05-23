// Maps router route names to the permission code required to open them.
// Routes not listed here are reachable by any authenticated company user
// (e.g. Dashboard, Profile). Owners implicitly pass every check.
export const ROUTE_PERMISSIONS = {
    // Warehouses
    WarehouseList: 'WAREHOUSE_READ',
    WarehouseCreate: 'WAREHOUSE_CREATE',
    WarehouseEdit: 'WAREHOUSE_UPDATE',

    // Company
    CompanySettings: 'COMPANY_READ',
    CompanyUsers: 'COMPANY_USER_READ',
    CompanyRoleList: 'COMPANY_ROLE_READ',

    // Catalog
    ProductList: 'PRODUCT_READ',
    ProductCreate: 'PRODUCT_CREATE',
    ProductEdit: 'PRODUCT_UPDATE',
    ProductVariantList: 'PRODUCT_VARIANT_READ',
    CategoryList: 'CATEGORY_READ',
    MeasurementUnitList: 'MEASUREMENT_UNIT_READ',
    AttributeList: 'ATTRIBUTE_READ',

    // Procurement
    SupplierList: 'SUPPLIER_READ',
    PurchaseOrderList: 'PURCHASE_ORDER_READ',
    PurchaseOrderCreate: 'PURCHASE_ORDER_CREATE',
    PurchaseOrderDetail: 'PURCHASE_ORDER_READ',

    // Sales
    CustomerList: 'CUSTOMER_READ',
    SalesOrderList: 'SALES_ORDER_READ',
    SalesOrderCreate: 'SALES_ORDER_CREATE',
    SalesOrderDetail: 'SALES_ORDER_READ',

    // Warehouse operations
    InventoryList: 'PRODUCT_VARIANT_WAREHOUSE_READ',
    TransferList: 'WAREHOUSE_TRANSFER_READ',
    TransferCreate: 'WAREHOUSE_TRANSFER_CREATE',
    TransferDetail: 'WAREHOUSE_TRANSFER_READ',
    AdjustmentList: 'STOCK_ADJUSTMENT_READ',
    AdjustmentCreate: 'STOCK_ADJUSTMENT_CREATE',
    AdjustmentDetail: 'STOCK_ADJUSTMENT_READ',
    BatchList: 'BATCH_READ',
    StockMovementList: 'STOCK_MOVEMENT_READ',

    // Operations
    SupplyList: 'SUPPLY_READ',
    SellingList: 'SELLING_READ',

    // Reporting
    WarehouseKPIs: 'REPORT_VIEW'
}
