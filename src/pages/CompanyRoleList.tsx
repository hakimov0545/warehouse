import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@entities/auth/model/auth";
import { useNotificationStore } from "@entities/notification/model/notification";
import { companyRoleApi } from "@entities/company/api/companyRole";
import { permissionApi } from "@entities/permission/api/permission";
import DataTable from "@shared/ui/DataTable";
import SearchInput from "@shared/ui/SearchInput";
import AppModal from "@shared/ui/AppModal";
import ConfirmDialog from "@shared/ui/ConfirmDialog";
import FormField from "@shared/ui/FormField";
import Can from "@features/access-control/Can";

const ACTION_TOKENS = [
	"CREATE",
	"READ",
	"UPDATE",
	"DELETE",
	"MANAGE",
	"VIEW",
];

export default function CompanyRoleList() {
	const { t } = useTranslation();
	const notify = useNotificationStore();
	const companyId = useAuthStore((s) => s.companyId);

	const [allRoles, setAllRoles] = useState([]);
	const [allPermissions, setAllPermissions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [permsLoading, setPermsLoading] = useState(false);
	const [search, setSearch] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [showDelete, setShowDelete] = useState(false);
	const [editing, setEditing] = useState(null);
	const [deleteTarget, setDeleteTarget] = useState(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [errors, setErrors] = useState({});

	const [form, setForm] = useState({ name: "" });
	const [selected, setSelected] = useState(() => new Set());

	const columns = useMemo(
		() => [
			{
				key: "name",
				label: t("companyRole.name"),
				sortable: true,
				cellClass: "cell-name",
			},
			{
				key: "permissions",
				label: t("companyRole.permissions"),
				render: (_v, row) => (
					<span className="perm-count">
						{(row.permissions || []).length}
					</span>
				),
			},
		],
		[t],
	);

	const items = useMemo(() => {
		if (!search) return allRoles;
		const q = search.toLowerCase();
		return allRoles.filter(
			(r) => r.name && r.name.toLowerCase().includes(q),
		);
	}, [search, allRoles]);

	// Group permissions by their module prefix (the code minus the trailing action).
	const permissionGroups = useMemo(() => {
		const groups = new Map();
		for (const perm of allPermissions) {
			const parts = (perm.code || "").split("_");
			const last = parts[parts.length - 1];
			const moduleKey = ACTION_TOKENS.includes(last)
				? parts.slice(0, -1).join("_")
				: perm.code;
			if (!groups.has(moduleKey)) groups.set(moduleKey, []);
			groups.get(moduleKey).push(perm);
		}
		return [...groups.entries()]
			.map(([key, list]) => ({
				key,
				label: key
					.replace(/_/g, " ")
					.replace(/\b\w/g, (c) => c.toUpperCase()),
				items: list,
			}))
			.sort((a, b) => a.label.localeCompare(b.label));
	}, [allPermissions]);

	function toggle(code) {
		const next = new Set(selected);
		if (next.has(code)) next.delete(code);
		else next.add(code);
		setSelected(next);
	}

	function selectAll() {
		setSelected(new Set(allPermissions.map((p) => p.code)));
	}

	function clearAll() {
		setSelected(new Set());
	}

	async function loadPermissions() {
		if (allPermissions.length) return;
		setPermsLoading(true);
		try {
			const { data } = await permissionApi.getAll();
			setAllPermissions(Array.isArray(data) ? data : []);
		} catch {
			setAllPermissions([]);
		} finally {
			setPermsLoading(false);
		}
	}

	async function load() {
		setLoading(true);
		try {
			if (!companyId) {
				setAllRoles([]);
				return;
			}
			const { data } =
				await companyRoleApi.getByCompanyId(companyId);
			setAllRoles(Array.isArray(data) ? data : []);
		} catch {
			setAllRoles([]);
		} finally {
			setLoading(false);
		}
	}

	async function openForm(item = null) {
		setEditing(item);
		setErrors({});
		await loadPermissions();
		if (item) {
			setForm({ name: item.name });
			setSelected(
				new Set((item.permissions || []).map((p) => p.code)),
			);
		} else {
			setForm({ name: "" });
			setSelected(new Set());
		}
		setShowForm(true);
	}

	function resolvePermissionIds() {
		// CompanyRoleRequest.permissionIds expects UUIDs; map selected codes
		// back to the permission objects returned by /api/permission/get-all.
		return allPermissions
			.filter((p) => selected.has(p.code))
			.map((p) => p.id)
			.filter(Boolean);
	}

	async function handleSubmit(e) {
		if (e && e.preventDefault) e.preventDefault();
		if (!form.name) {
			setErrors({ name: t("common.required") });
			return;
		}
		setSaving(true);
		try {
			const companyId = useAuthStore.getState().companyId;
			const payload = {
				name: form.name,
				companyId,
				permissionIds: resolvePermissionIds(),
			};
			if (editing) {
				await companyRoleApi.update(editing.id, payload);
				notify.success(t("companyRole.updated"));
			} else {
				await companyRoleApi.create(payload);
				notify.success(t("companyRole.created"));
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
			await companyRoleApi.delete(deleteTarget.id);
			notify.success(t("companyRole.deleted"));
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
	}, [companyId]);

	return (
		<div className="page-view">
			<div className="page-header">
				<h1>{t("companyRole.title")}</h1>
				<Can permission="COMPANY_ROLE_CREATE">
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
						{t("companyRole.addNew")}
					</button>
				</Can>
			</div>

			<DataTable
				columns={columns}
				data={items}
				loading={loading}
				emptyText={t("companyRole.empty")}
				actionsLabel={t("common.actions")}
				toolbar={
					<SearchInput
						value={search}
						onChange={setSearch}
						placeholder={t("common.search")}
					/>
				}
				actions={(row) => (
					<>
						<Can permission="COMPANY_ROLE_UPDATE">
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
						</Can>
						<Can permission="COMPANY_ROLE_DELETE">
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
						</Can>
					</>
				)}
			/>

			<AppModal
				open={showForm}
				onClose={() => setShowForm(false)}
				title={
					editing
						? t("companyRole.editTitle")
						: t("companyRole.addTitle")
				}
				size="lg"
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
							onClick={handleSubmit}
							disabled={saving}
						>
							{saving && (
								<span className="spinner"></span>
							)}
							{t("common.save")}
						</button>
					</>
				}
			>
				<form onSubmit={handleSubmit} className="modal-form">
					<FormField
						label={t("companyRole.name")}
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

					<div className="perm-section">
						<div className="perm-section-head">
							<label>
								{t("companyRole.permissions")}
							</label>
							<div className="perm-section-actions">
								<button
									type="button"
									className="link-btn"
									onClick={selectAll}
								>
									{t("companyRole.selectAll")}
								</button>
								<button
									type="button"
									className="link-btn"
									onClick={clearAll}
								>
									{t("companyRole.clearAll")}
								</button>
							</div>
						</div>

						{permsLoading ? (
							<div className="perm-loading">
								<span className="spinner"></span>
							</div>
						) : permissionGroups.length === 0 ? (
							<p className="perm-empty">
								{t("companyRole.noPermissions")}
							</p>
						) : (
							<div className="perm-groups">
								{permissionGroups.map((group) => (
									<div
										key={group.key}
										className="perm-group"
									>
										<div className="perm-group-title">
											{group.label}
										</div>
										<div className="perm-grid">
											{group.items.map(
												(perm) => (
													<label
														key={
															perm.code
														}
														className={`perm-item ${selected.has(perm.code) ? "checked" : ""}`}
													>
														<input
															type="checkbox"
															checked={selected.has(
																perm.code,
															)}
															onChange={() =>
																toggle(
																	perm.code,
																)
															}
														/>
														<span className="perm-name">
															{perm.name ||
																perm.code}
														</span>
														<span className="perm-code">
															{
																perm.code
															}
														</span>
													</label>
												),
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</form>
			</AppModal>

			<ConfirmDialog
				open={showDelete}
				onClose={() => setShowDelete(false)}
				onConfirm={handleDelete}
				title={t("common.confirmDelete")}
				message={t("companyRole.deleteConfirm")}
				confirmText={t("common.delete")}
				cancelText={t("common.cancel")}
				variant="danger"
				loading={deleting}
			/>

			<style>{`
        .perm-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 26px;
          padding: 2px 8px;
          border-radius: 999px;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .perm-section {
          margin-top: 16px;
        }

        .perm-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .perm-section-head label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-primary);
        }

        .perm-section-actions {
          display: flex;
          gap: 12px;
        }

        .link-btn {
          background: none;
          border: none;
          padding: 0;
          font-size: 0.78rem;
          color: var(--accent);
          cursor: pointer;
        }

        .link-btn:hover {
          text-decoration: underline;
        }

        .perm-loading,
        .perm-empty {
          padding: 20px 0;
          text-align: center;
          color: var(--text-secondary);
          font-size: 0.85rem;
        }

        .perm-groups {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 50vh;
          overflow-y: auto;
          padding-right: 4px;
        }

        .perm-group-title {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 6px;
        }

        .perm-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 6px;
        }

        .perm-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: border-color var(--transition-fast), background var(--transition-fast);
        }

        .perm-item:hover {
          border-color: var(--accent);
        }

        .perm-item.checked {
          border-color: var(--accent);
          background: var(--accent-soft);
        }

        .perm-item input {
          flex-shrink: 0;
        }

        .perm-name {
          flex: 1;
          font-size: 0.82rem;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .perm-code {
          font-size: 0.66rem;
          color: var(--text-muted);
          font-family: monospace;
        }
      `}</style>
		</div>
	);
}
