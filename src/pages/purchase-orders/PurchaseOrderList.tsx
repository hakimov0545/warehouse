import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@entities/auth/model/auth";
import { purchaseOrderApi } from "@entities/order/api/purchaseOrder";
import { usePaginatedList } from "@shared/hooks/usePaginatedList";
import { formatPrice, formatDate } from "@shared/utils/formatters";
import DataTable from "@shared/ui/DataTable";
import SearchInput from "@shared/ui/SearchInput";
import StatusBadge from "@shared/ui/StatusBadge";
import TablePagination from "@shared/ui/TablePagination";
import Can from "@features/access-control/Can";

export default function PurchaseOrderList() {
	const { t } = useTranslation();
	const navigate = useNavigate();
	const company = useAuthStore((s) => s.company);

	const [search, setSearch] = useState("");
	const [activeStatus, setActiveStatus] = useState(null);

	const statusTabs = useMemo(
		() => [
			{ value: null, label: t("common.all") },
			{
				value: "DRAFT",
				label: t("purchaseOrder.status.draft"),
			},
			{
				value: "SUBMITTED",
				label: t("purchaseOrder.status.submitted"),
			},
			{
				value: "APPROVED",
				label: t("purchaseOrder.status.approved"),
			},
			{
				value: "RECEIVED",
				label: t("purchaseOrder.status.received"),
			},
			{
				value: "CANCELLED",
				label: t("purchaseOrder.status.cancelled"),
			},
		],
		[t],
	);

	const {
		items,
		loading,
		page,
		pageSize,
		totalPages,
		totalElements,
		setPage,
		setPageSize,
		refresh,
	} = usePaginatedList((params) =>
		purchaseOrderApi.getByCompany(company?.id, {
			...params,
			...(activeStatus ? { status: activeStatus } : {}),
		}),
		{ immediate: Boolean(company?.id), queryKey: ["purchase-orders", company?.id, activeStatus] },
	);

	const columns = useMemo(
		() => [
			{
				key: "documentNumber",
				label: t("purchaseOrder.documentNumber"),
				sortable: true,
				cellClass: "cell-name",
			},
			{
				key: "warehouseName",
				label: t("purchaseOrder.warehouse"),
				sortable: true,
			},
			{
				key: "supplierName",
				label: t("purchaseOrder.supplier"),
				sortable: true,
			},
			{
				key: "status",
				label: t("purchaseOrder.status.label"),
				sortable: true,
				render: (_v, row) => (
					<StatusBadge
						status={row.status}
						label={t(
							"purchaseOrder.status." + row.status,
						)}
					/>
				),
			},
			{
				key: "orderDate",
				label: t("purchaseOrder.orderDate"),
				sortable: true,
				render: (v) => formatDate(v),
			},
			{
				key: "totalAmount",
				label: t("purchaseOrder.totalAmount"),
				align: "right",
				sortable: true,
				render: (v) => (
					<span className="cell-price">
						{formatPrice(v)}
					</span>
				),
			},
		],
		[t],
	);

	const filteredItems = useMemo(() => {
		if (!search) return items;
		const q = search.toLowerCase();
		return items.filter(
			(o) =>
				(o.documentNumber &&
					o.documentNumber.toLowerCase().includes(q)) ||
				(o.warehouseName &&
					o.warehouseName.toLowerCase().includes(q)) ||
				(o.supplierName &&
					o.supplierName.toLowerCase().includes(q)),
		);
	}, [items, search]);

	function setStatus(status) {
		setActiveStatus(status);
		setPage(0);
	}

	return (
		<div className="page-view">
			<div className="page-header">
				<h1>{t("purchaseOrder.title")}</h1>
				<Can permission="PURCHASE_ORDER_CREATE">
					<Link
						to="/purchase-orders/new"
						className="btn btn-primary"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
						{t("purchaseOrder.newOrder")}
					</Link>
				</Can>
			</div>

			<div className="filter-bar">
				<div className="filter-group">
					{statusTabs.map((tab) => (
						<button
							key={String(tab.value)}
							className={`btn btn-ghost ${activeStatus === tab.value ? "btn-secondary" : ""}`}
							onClick={() => setStatus(tab.value)}
						>
							{tab.label}
						</button>
					))}
				</div>
			</div>

			<DataTable
				columns={columns}
				data={filteredItems}
				loading={loading}
				emptyText={t("purchaseOrder.empty")}
				pageOffset={page * pageSize}
				onRowClick={(row) =>
					navigate(`/purchase-orders/${row.id}`)
				}
				toolbar={
					<SearchInput
						value={search}
						onChange={setSearch}
						placeholder={t("common.search")}
					/>
				}
				actions={(row) => (
					<Link
						to={`/purchase-orders/${row.id}`}
						className="btn-icon"
						title={t("common.view")}
						onClick={(e) => e.stopPropagation()}
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
							<circle cx="12" cy="12" r="3" />
						</svg>
					</Link>
				)}
				pagination={
					<TablePagination
						page={page}
						totalPages={totalPages}
						totalElements={totalElements}
						pageSize={pageSize}
						onPageChange={setPage}
						onPageSizeChange={setPageSize}
					/>
				}
			/>
		</div>
	);
}
