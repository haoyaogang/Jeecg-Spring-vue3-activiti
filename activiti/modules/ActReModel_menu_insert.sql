-- 注意：该页面对应的前台目录为views/modules文件夹下
-- 如果你想更改到其他目录，请修改sql中component字段对应的值


INSERT INTO sys_permission(id, parent_id, name, url, component, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_route, is_leaf, keep_alive, hidden, hide_tab, description, status, del_flag, rule_flag, create_by, create_time, update_by, update_time, internal_or_external) 
VALUES ('2023120412005980240', NULL, 'act_re_model', '/modules/actReModelList', 'modules/ActReModelList', NULL, NULL, 0, NULL, '1', 0.00, 0, NULL, 1, 0, 0, 0, 0, NULL, '1', 0, 0, 'admin', '2023-12-04 12:00:24', NULL, NULL, 0);

-- 权限控制sql
-- 新增
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2023120412005980241', '2023120412005980240', '添加act_re_model', NULL, NULL, 0, NULL, NULL, 2, 'modules:act_re_model:add', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2023-12-04 12:00:24', NULL, NULL, 0, 0, '1', 0);
-- 编辑
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2023120412005980242', '2023120412005980240', '编辑act_re_model', NULL, NULL, 0, NULL, NULL, 2, 'modules:act_re_model:edit', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2023-12-04 12:00:24', NULL, NULL, 0, 0, '1', 0);
-- 删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2023120412005980243', '2023120412005980240', '删除act_re_model', NULL, NULL, 0, NULL, NULL, 2, 'modules:act_re_model:delete', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2023-12-04 12:00:24', NULL, NULL, 0, 0, '1', 0);
-- 批量删除
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2023120412005980244', '2023120412005980240', '批量删除act_re_model', NULL, NULL, 0, NULL, NULL, 2, 'modules:act_re_model:deleteBatch', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2023-12-04 12:00:24', NULL, NULL, 0, 0, '1', 0);
-- 导出excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2023120412005980245', '2023120412005980240', '导出excel_act_re_model', NULL, NULL, 0, NULL, NULL, 2, 'modules:act_re_model:exportXls', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2023-12-04 12:00:24', NULL, NULL, 0, 0, '1', 0);
-- 导入excel
INSERT INTO sys_permission(id, parent_id, name, url, component, is_route, component_name, redirect, menu_type, perms, perms_type, sort_no, always_show, icon, is_leaf, keep_alive, hidden, hide_tab, description, create_by, create_time, update_by, update_time, del_flag, rule_flag, status, internal_or_external)
VALUES ('2023120412005980246', '2023120412005980240', '导入excel_act_re_model', NULL, NULL, 0, NULL, NULL, 2, 'modules:act_re_model:importExcel', '1', NULL, 0, NULL, 1, 0, 0, 0, NULL, 'admin', '2023-12-04 12:00:24', NULL, NULL, 0, 0, '1', 0);