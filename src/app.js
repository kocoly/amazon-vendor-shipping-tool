// ==========================================
// 1. 箱规数据库管理
// ==========================================
const DEFAULT_SPECS = [
    { name: "示例摄影支架 A", asin: "B000XXXXX1", pcs: 20, vol: 1.5, weight: 12.5 },
    { name: "示例三脚架 B", asin: "B000XXXXX2", pcs: 10, vol: 2.1, weight: 18.0 }
];

let boxSpecs = JSON.parse(localStorage.getItem('vendor_box_specs')) || DEFAULT_SPECS;
let editingAsin = null;

function saveSpecsToStorage() {
    localStorage.setItem('vendor_box_specs', JSON.stringify(boxSpecs));
}

function renderSpecTable(data = boxSpecs) {
    const tbody = document.getElementById('specTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(item.name || '-')}</td>
            <td><strong>${escapeHtml(item.asin)}</strong></td>
            <td>${item.pcs}</td>
            <td>${item.vol}</td>
            <td>${item.weight}</td>
            <td>
                <button class="btn btn-edit btn-edit-spec" data-asin="${escapeHtml(item.asin)}">编辑</button>
                <button class="btn btn-danger btn-del-spec" data-asin="${escapeHtml(item.asin)}">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // 动态绑定操作列按钮事件
    tbody.querySelectorAll('.btn-edit-spec').forEach(btn => {
        btn.addEventListener('click', (e) => openEditSpecModal(e.target.dataset.asin));
    });
    tbody.querySelectorAll('.btn-del-spec').forEach(btn => {
        btn.addEventListener('click', (e) => deleteSpec(e.target.dataset.asin));
    });
}

function searchBoxSpecs() {
    const query = document.getElementById('searchAsinInput').value.toLowerCase().trim();
    const filtered = boxSpecs.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) || 
        item.asin.toLowerCase().includes(query)
    );
    renderSpecTable(filtered);
}

function openAddSpecModal() {
    editingAsin = null;
    document.getElementById('modalTitle').innerText = '新增箱规';
    document.getElementById('modalName').value = '';
    document.getElementById('modalAsin').value = '';
    document.getElementById('modalAsin').disabled = false;
    document.getElementById('modalPcs').value = '';
    document.getElementById('modalVol').value = '';
    document.getElementById('modalWeight').value = '';
    document.getElementById('specModal').style.display = 'flex';
}

function openEditSpecModal(asin) {
    const target = boxSpecs.find(item => item.asin === asin);
    if (!target) return;
    editingAsin = asin;
    document.getElementById('modalTitle').innerText = '修改箱规';
    document.getElementById('modalName').value = target.name || '';
    document.getElementById('modalAsin').value = target.asin;
    document.getElementById('modalAsin').disabled = true;
    document.getElementById('modalPcs').value = target.pcs;
    document.getElementById('modalVol').value = target.vol;
    document.getElementById('modalWeight').value = target.weight;
    document.getElementById('specModal').style.display = 'flex';
}

function closeSpecModal() {
    document.getElementById('specModal').style.display = 'none';
}

function saveSpec() {
    const asin = document.getElementById('modalAsin').value.trim();
    const name = document.getElementById('modalName').value.trim();
    const pcs = parseInt(document.getElementById('modalPcs').value, 10);
    const vol = parseFloat(document.getElementById('modalVol').value);
    const weight = parseFloat(document.getElementById('modalWeight').value);

    if (!asin || isNaN(pcs) || isNaN(vol) || isNaN(weight)) {
        alert('请正确填写 ASIN、单箱 PCS、单箱体积与重量！');
        return;
    }

    if (editingAsin) {
        const index = boxSpecs.findIndex(item => item.asin === editingAsin);
        if (index !== -1) boxSpecs[index] = { name, asin, pcs, vol, weight };
    } else {
        if (boxSpecs.some(item => item.asin === asin)) {
            alert('该 ASIN 已存在于数据库中！');
            return;
        }
        boxSpecs.push({ name, asin, pcs, vol, weight });
    }

    saveSpecsToStorage();
    renderSpecTable();
    closeSpecModal();
}

function deleteSpec(asin) {
    if (confirm(`确定要删除 ASIN: ${asin} 的箱规配置吗？`)) {
        boxSpecs = boxSpecs.filter(item => item.asin !== asin);
        saveSpecsToStorage();
        renderSpecTable();
    }
}

function resetDefaultDB() {
    if (confirm('确定要重置箱规数据库吗？')) {
        boxSpecs = [...DEFAULT_SPECS];
        saveSpecsToStorage();
        renderSpecTable();
    }
}

function exportSpecsToExcel() {
    if (typeof XLSX === 'undefined') return alert('SheetJS 组件尚未完成加载');
    const ws = XLSX.utils.json_to_sheet(boxSpecs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "箱规数据库");
    XLSX.writeFile(wb, "Vendor_Box_Specs.xlsx");
}
// 批量导入箱规（支持多个文件）
window.importSpecsFromFiles = async function() {
    const input = document.getElementById('specFileInput');
    if (!input || !input.files || input.files.length === 0) {
        return alert('请先选择要导入的 Excel/CSV 文件（可多选）。');
    }

    const overwrite = !!document.getElementById('specOverwriteChk') && document.getElementById('specOverwriteChk').checked;

    try {
        let rows = [];
        for (let i = 0; i < input.files.length; i++) {
            const file = input.files[i];
            const data = await readExcelFile(file); // readExcelFile 已存在
            // readExcelFile 返回每行对象数组
            rows = rows.concat(data);
        }

        if (rows.length === 0) return alert('未在文件中解析到任何行，请检查文件格式或表头。');

        // 归一化列名并转换为箱规对象
        const normalized = rows.map(r => normalizeSpecRow(r)).filter(x => x !== null);

        // 统计
        let added = 0, updated = 0, skipped = 0, invalid = 0;
        const invalidRows = [];

        normalized.forEach(item => {
            if (!item.asin) {
                invalid++;
                invalidRows.push({ reason: '缺少 ASIN', raw: item.raw });
                return;
            }
            // 验证数值
            if (!Number.isFinite(item.pcs) || !Number.isFinite(item.vol) || !Number.isFinite(item.weight)) {
                invalid++;
                invalidRows.push({ reason: '数字字段不合法', asin: item.asin, raw: item.raw });
                return;
            }

            const idx = boxSpecs.findIndex(s => s.asin === item.asin);
            if (idx === -1) {
                boxSpecs.push({ name: item.name || '', asin: item.asin, pcs: item.pcs, vol: item.vol, weight: item.weight });
                added++;
            } else {
                if (overwrite) {
                    boxSpecs[idx] = { name: item.name || boxSpecs[idx].name, asin: item.asin, pcs: item.pcs, vol: item.vol, weight: item.weight };
                    updated++;
                } else {
                    skipped++;
                }
            }
        });

        saveSpecsToStorage();
        renderSpecTable();

        let msg = `导入完成：新增 ${added} 条；更新 ${updated} 条；跳过 ${skipped} 条；无效 ${invalid} 条。`;
        if (invalid > 0) msg += '\n（存在无效行，请检查表头/数值，例如 ASIN、PCS、Vol、Weight）';
        alert(msg);

        // 如果需要，可以在页面上显示 invalidRows 的详细信息，或下载为日志，暂以 alert 简单提示
        console.log('批量导入无效行样例：', invalidRows.slice(0,5));
    } catch (err) {
        console.error(err);
        alert('导入失败：' + (err && err.message ? err.message : String(err)));
    } finally {
        // 清空 input，方便重复导入相同文件
        input.value = '';
    }
};

// 将 Excel/CSV 行对象归一化成箱规项，返回 null 表示不可用行
function normalizeSpecRow(row) {
    // 小写 key map 方便匹配
    const keys = {};
    Object.keys(row || {}).forEach(k => keys[k.toString().toLowerCase().trim()] = k);

    // 可能的列名（中文/英文混合）
    const asinKey = keys['asin'] || keys['asin码'] || keys['asin/asin'] || keys['seller sku'] || keys['sku'] || keys['asin code'] || keys['asin码'];
    const nameKey = keys['name'] || keys['品名'] || keys['描述'] || keys['title'] || keys['product name'];
    const pcsKey = keys['pcs'] || keys['单箱 pcs'] || keys['case qty'] || keys['carton qty'] || keys['pcs/箱'] || keys['pcs数量'];
    const volKey = keys['vol'] || keys['volume'] || keys['体积'] || keys['单箱体积'] || keys['volume (cuft)'] || keys['cuft'];
    const weightKey = keys['weight'] || keys['lbs'] || keys['重量'] || keys['单箱重量'] || keys['weight (lbs)'];

    const asin = asinKey ? String(row[asinKey]).trim() : (row['ASIN'] ? String(row['ASIN']).trim() : '');
    const name = nameKey ? String(row[nameKey] || '').trim() : String(row['Name'] || row['品名'] || '') .trim();
    const pcs = pcsKey ? parseInt(String(row[pcsKey]).replace(/,/g,''), 10) : parseInt(String(row['PCS'] || row['pcs'] || 0).replace(/,/g,''), 10);
    const vol = volKey ? parseFloat(String(row[volKey]).replace(/,/g,'')) : parseFloat(String(row['Vol'] || row['vol'] || 0).replace(/,/g,''));
    const weight = weightKey ? parseFloat(String(row[weightKey]).replace(/,/g,'')) : parseFloat(String(row['Weight'] || row['weight'] || 0).replace(/,/g,''));

    // 若没有 ASIN，则丢弃
    if (!asin) return null;

    return { asin, name, pcs: Number.isFinite(pcs) ? pcs : NaN, vol: Number.isFinite(vol) ? vol : NaN, weight: Number.isFinite(weight) ? weight : NaN, raw: row };
}
// ==========================================
// 2. 货件协同数据核心算法
// ==========================================
let processedResult = { summary: [], table1: [], table2: [], initData: [] };

async function processShippingData() {
    const fileInput = document.getElementById('excelFileInput');
    const files = fileInput ? fileInput.files : null;

    if (!files || files.length === 0) {
        alert('请先选择至少一个 Vendor Central 导出的 PO 数据表格！');
        return;
    }

    try {
        let rawData = [];
        for (let i = 0; i < files.length; i++) {
            const data = await readExcelFile(files[i]);
            rawData = rawData.concat(data);
        }

        if (rawData.length === 0) {
            alert('未能解析到有效的表格内容，请检查文件！');
            return;
        }

        const arnText = document.getElementById('arnText').value.trim();
        const arnMapping = parseArnText(arnText);

        calculateShippingTables(rawData, arnMapping);

        document.getElementById('resultCard').style.display = 'block';
        document.getElementById('downloadAllBtn').style.display = 'inline-flex';

        renderResultTables();
        alert('协同计算已完成！');
    } catch (err) {
        console.error(err);
        alert('处理表格数据失败: ' + err.message);
    }
}

function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                if (typeof XLSX === 'undefined') throw new Error('SheetJS 未正确加载');
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
                resolve(jsonData);
            } catch (err) { reject(err); }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function parseArnText(text) {
    const map = {};
    if (!text) return map;
    const lines = text.split('\n');
    let currentArn = "";
    lines.forEach(line => {
        const arnMatch = line.match(/(ARN|Shipment\s*ID)[:：]?\s*([A-Za-z0-9]+)/i);
        if (arnMatch) currentArn = arnMatch[2];
        const poMatches = line.match(/[A-Z0-9]{8}/g);
        if (poMatches && currentArn) {
            poMatches.forEach(po => map[po] = currentArn);
        }
    });
    return map;
}

function calculateShippingTables(rawData, arnMapping) {
    processedResult.initData = rawData;
    let summaryList = [];

    rawData.forEach(row => {
        const po = row['PO'] || row['Purchase Order'] || row['PO Number'] || 'N/A';
        const asin = row['ASIN'] || row['Item'] || 'N/A';
        const qty = parseInt(row['Quantity'] || row['Qty'] || row['Ordered Quantity'] || 0, 10);
        
        const spec = boxSpecs.find(s => s.asin === asin) || { pcs: 1, vol: 0, weight: 0 };
        const cartons = spec.pcs > 0 ? Math.ceil(qty / spec.pcs) : 0;
        const totalVol = (cartons * spec.vol).toFixed(2);
        const totalWeight = (cartons * spec.weight).toFixed(2);
        const arn = arnMapping[po] || row['ARN'] || '待补充';

        summaryList.push({
            'PO 号': po,
            'ASIN': asin,
            '需求数量': qty,
            '单箱 PCS': spec.pcs,
            '预估箱数': cartons,
            '总体积 (cuFt)': totalVol,
            '总重量 (lbs)': totalWeight,
            'ARN/Shipment ID': arn
        });
    });

    processedResult.summary = summaryList;
    processedResult.table1 = summaryList;
    processedResult.table2 = summaryList;
}

// ==========================================
// 3. Tab 切换与表格渲染
// ==========================================
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
    if (btn) btn.classList.add('active');
}

function renderResultTables() {
    renderHTMLTable('tableSummary', processedResult.summary);
    renderHTMLTable('table1', processedResult.table1);
    renderHTMLTable('table2', processedResult.table2);
    renderHTMLTable('tableInit', processedResult.initData);
}

function renderHTMLTable(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = '<p style="padding:15px; color:#64748b;">暂无数据</p>';
        return;
    }

    const headers = Object.keys(data[0]);
    let html = '<table><thead><tr>';
    headers.forEach(h => html += `<th>${escapeHtml(h)}</th>`);
    html += '</tr></thead><tbody>';

    data.forEach(row => {
        html += '<tr>';
        headers.forEach(h => html += `<td>${escapeHtml(String(row[h] !== undefined ? row[h] : ''))}</td>`);
        html += '</tr>';
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function exportAllTablesToExcel() {
    if (typeof XLSX === 'undefined') return alert('SheetJS 库未加载');
    const wb = XLSX.utils.book_new();
    if (processedResult.summary.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.summary), "四表汇总");
    if (processedResult.table1.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.table1), "表一_Shipment分配");
    if (processedResult.table2.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.table2), "表二_预约汇总");
    if (processedResult.initData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.initData), "初始校验数据");

    XLSX.writeFile(wb, "Amazon_Vendor_货件协同结果.xlsx");
}

// ==========================================
// 4. 事件监听器注册 (保证 DOM 加载后绑定)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderSpecTable();

    // 核心按钮事件绑定
    document.getElementById('btnProcess')?.addEventListener('click', processShippingData);
    document.getElementById('downloadAllBtn')?.addEventListener('click', exportAllTablesToExcel);

    // 箱规管理按钮绑定
    document.getElementById('searchAsinInput')?.addEventListener('input', searchBoxSpecs);
    document.getElementById('btnAddSpec')?.addEventListener('click', openAddSpecModal);
    document.getElementById('btnResetDB')?.addEventListener('click', resetDefaultDB);
    document.getElementById('btnExportSpecs')?.addEventListener('click', exportSpecsToExcel);
    document.getElementById('btnCloseModal')?.addEventListener('click', closeSpecModal);
    document.getElementById('btnSaveSpec')?.addEventListener('click', saveSpec);

    // Tab 切换按钮绑定
    document.getElementById('btnTabSummary')?.addEventListener('click', (e) => switchTab('tabSummary', e.target));
    document.getElementById('btnTabTable1')?.addEventListener('click', (e) => switchTab('tabTable1', e.target));
    document.getElementById('btnTabTable2')?.addEventListener('click', (e) => switchTab('tabTable2', e.target));
    document.getElementById('btnTabInit')?.addEventListener('click', (e) => switchTab('tabInit', e.target));
});
