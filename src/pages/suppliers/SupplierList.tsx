import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@entities/auth/model/auth";
import { supplierApi } from "@entities/supplier/api/supplier";
import { useNotificationStore } from "@entities/notification/model/notification";
import DataTable from "@shared/ui/DataTable";
import SearchInput from "@shared/ui/SearchInput";
import AppModal from "@shared/ui/AppModal";
import ConfirmDialog from "@shared/ui/ConfirmDialog";
import FormField from "@shared/ui/FormField";
import Can from "@features/access-control/Can";

export default function SupplierList() {
	const { t } = useTranslation();
	const companyId = useAuthStore((s) => s.companyId);
	const notify = useNotificationStore();

	const [allItems, setAllItems] = useState([]);
	const [loading, setLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [editing, setEditing] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [errors, setErrors] = useState({});

	const [form, setForm] = useState({
		name: "",
		inn: "",
		phone: "",
		email: "",
		address: "",
		contactPerson: "",
	});

	const columns = useMemo(
		() => [
			{
				key: "name",
				label: t("supplier.name"),
				sortable: true,
				cellClass: "cell-name",
			},
			{ key: "inn", label: t("supplier.inn"), sortable: true },
			{ key: "phone", label: t("supplier.phone") },
			{ key: "email", label: t("supplier.email") },
			{
				key: "contactPerson",
				label: t("supplier.contactPerson"),
			},
		],
		[t],
	);

	const items = useMemo(() => {
		if (!search) return allItems;
		const q = search.toLowerCase();
		return allItems.filter(
			(s) =>
				(s.name && s.name.toLowerCase().includes(q)) ||
				(s.inn && s.inn.toLowerCase().includes(q)) ||
				(s.phone && s.phone.includes(q)),
		);
	}, [allItems, search]);

	async function load() {
		setLoading(true);
		try {
			if (!companyId) {
				setAllItems([]);
				return;
			}
			const { data } =
				await supplierApi.getByCompany(companyId);
			setAllItems(Array.isArray(data) ? data : []);
		} catch {
			setAllItems([]);
		} finally {
			setLoading(false);
		}
	}

	function openForm(item = null) {
		setEditing(item);
		setErrors({});
		if (item) {
			setForm({
				name: item.name,
				inn: item.inn || "",
				phone: item.phone || "",
				email: item.email || "",
				address: item.address || "",
				contactPerson: item.contactPerson || "",
			});
		} else {
			setForm({
				name: "",
				inn: "",
				phone: "",
				email: "",
				address: "",
				contactPerson: "",
			});
		}
		setShowForm(true);
	}

	async function handleSubmit(e) {
		if (e) e.preventDefault();
		if (!form.name) {
			setErrors({ name: t("common.required") });
			return;
		}
		setSaving(true);

		try {
			const payload = { ...form, companyId: companyId };
			if (editing) {
				await supplierApi.update(editing.id, payload);
				notify.success(t("supplier.updated"));
			} else {
				await supplierApi.create(payload);
				notify.success(t("supplier.created"));
			}
			setShowForm(false);
			await load();
		} catch (err) {
			notify.error(
				err.response?.data?.message || t("common.error"),
			);
		} finally {
			setSaving(false);
		}
	}

	function confirmDelete(row) {
		setDeleteTarget(row);
		setShowDelete(true);
	}

	async function handleDelete() {
		setDeleting(true);
		try {
			await supplierApi.delete(deleteTarget.id);
			notify.success(t("supplier.deleted"));
			setShowDelete(false);
			await load();
		} catch (err) {
			notify.error(
				err.response?.data?.message || t("common.error"),
			);
		} finally {
			setDeleting(false);
		}
	}

	useEffect(() => {
		if (!companyId) return;
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [companyId]);

	const toolbar = (
		<SearchInput
			value={search}
			onChange={setSearch}
			placeholder={t("common.search")}
		/>
	);

	return (
		<div className="page-view">
			<div className="page-header">
				<h1>{t("supplier.title")}</h1>
				<Can permission="SUPPLIER_CREATE">
					<button
						className="btn btn-primary"
						onClick={() => openForm()}
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
						{t("supplier.addNew")}
					</button>
				</Can>
			</div>

			<DataTable
				columns={columns}
				data={items}
				loading={loading}
				emptyText={t("supplier.empty")}
				toolbar={toolbar}
				actions={(row) => (
					<>
						<button
							className="btn-icon"
							onClick={() => openForm(row)}
							title={t("common.edit")}
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
						</button>
						<button
							className="btn-icon danger"
							onClick={() => confirmDelete(row)}
							title={t("common.delete")}
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
							>
								<polyline points="3 6 5 6 21 6" />
								<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
							</svg>
						</button>
					</>
				)}
			/>

			<AppModal
				open={showForm}
				onClose={() => setShowForm(false)}
				title={
					editing
						? t("supplier.editTitle")
						: t("supplier.addTitle")
				}
				size="md"
				footer={
					<>
						<button
							className="btn btn-secondary"
							onClick={() => setShowForm(false)}
						>
							{t("common.cancel")}
						</button>
						<button
							className="btn btn-primary"
							onClick={() => handleSubmit()}
							disabled={saving}
						>
							{saving && <span className="spinner" />}
							{t("common.save")}
						</button>
					</>
				}
			>
				<form onSubmit={handleSubmit} className="modal-form">
					<FormField
						label={t("supplier.name")}
						error={errors.name}
						required
					>
						<input
							value={form.name}
							onChange={(e) =>
								setForm({
									...form,
									name: e.target.value,
								})
							}
							type="text"
							required
						/>
					</FormField>
					<div className="form-row">
						<FormField label={t("supplier.inn")}>
							<input
								value={form.inn}
								onChange={(e) =>
									setForm({
										...form,
										inn: e.target.value,
									})
								}
								type="text"
							/>
						</FormField>
						<FormField label={t("supplier.phone")}>
							<input
								value={form.phone}
								onChange={(e) =>
									setForm({
										...form,
										phone: e.target.value,
									})
								}
								type="text"
							/>
						</FormField>
					</div>
					<FormField label={t("supplier.email")}>
						<input
							value={form.email}
							onChange={(e) =>
								setForm({
									...form,
									email: e.target.value,
								})
							}
							type="email"
						/>
					</FormField>
					<FormField label={t("supplier.address")}>
						<textarea
							value={form.address}
							onChange={(e) =>
								setForm({
									...form,
									address: e.target.value,
								})
							}
							rows="2"
						/>
					</FormField>
					<FormField label={t("supplier.contactPerson")}>
						<input
							value={form.contactPerson}
							onChange={(e) =>
								setForm({
									...form,
									contactPerson: e.target.value,
								})
							}
							type="text"
						/>
					</FormField>
				</form>
			</AppModal>

			<ConfirmDialog
				open={showDelete}
				onClose={() => setShowDelete(false)}
				onConfirm={handleDelete}
				title={t("common.confirmDelete")}
				message={t("supplier.deleteConfirm")}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				loading={deleting}
			/>
		</div>
	);
}
