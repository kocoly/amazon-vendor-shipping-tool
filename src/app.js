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

// ==========================================
// 批量导入箱规功能
// ==========================================
function importSpecsFromExcel(file) {
    if (typeof XLSX === 'undefined') {
        alert('SheetJS 库未加载，无法解析 Excel');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

            if (jsonData.length === 0) {
                alert('导入的文件中没有找到有效数据！');
                return;
            }

            let successCount = 0;
            let updateCount = 0;

            jsonData.forEach(row => {
                const lowerRow = {};
                Object.keys(row).forEach(k => {
                    lowerRow[k.trim().toLowerCase()] = row[k];
                });

                const asin = String(lowerRow['asin'] || '').trim();
                const name = String(lowerRow['name'] || lowerRow['品名'] || lowerRow['品名描述'] || lowerRow['description'] || '').trim();
                const pcs = parseInt(lowerRow['pcs'] || lowerRow['单箱 pcs'] || lowerRow['单箱pcs'] || 0, 10);
                const vol = parseFloat(lowerRow['vol'] || lowerRow['单箱体积 (cuft)'] || lowerRow['单箱体积'] || lowerRow['cuft'] || 0);
                const weight = parseFloat(lowerRow['weight'] || lowerRow['单箱重量 (lbs)'] || lowerRow['单箱重量'] || lowerRow['lbs'] || 0);

                if (asin && !isNaN(pcs) && pcs > 0 && !isNaN(vol) && !isNaN(weight)) {
                    const existingIndex = boxSpecs.findIndex(item => item.asin === asin);
                    if (existingIndex !== -1) {
                        boxSpecs[existingIndex] = { name, asin, pcs, vol, weight };
                        updateCount++;
                    } else {
                        boxSpecs.push({ name, asin, pcs, vol, weight });
                        successCount++;
                    }
                }
            });

            saveSpecsToStorage();
            renderSpecTable();

            alert(`批量导入完成！\n新增箱规：${successCount} 条\n覆盖更新：${updateCount} 条`);
        } catch (err) {
            console.error(err);
            alert('读取 Excel 文件失败，请检查文件格式是否正确！');
        }
    };
    reader.readAsArrayBuffer(file);
}

// ==========================================
// 辅助函数：计算 Window Start 到 Window End 范围内的周四
// ==========================================
function calculateExpectedDate(windowStartStr, windowEndStr) {
    if (!windowStartStr || !windowEndStr) return '';

    let start = new Date(windowStartStr);
    let end = new Date(windowEndStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';

    let curr = new Date(start);
    while (curr <= end) {
        if (curr.getDay() === 4) { // 4 代表周四
            const y = curr.getFullYear();
            const m = curr.getMonth() + 1;
            const d = curr.getDate();
            return `${y}/${m}/${d}`;
        }
        curr.setDate(curr.getDate() + 1);
    }
    return '';
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
        let rawDataFiles = [];
        for (let i = 0; i < files.length; i++) {
            const data = await readExcelFile(files[i]);
            rawDataFiles.push({ fileName: files[i].name, data: data });
        }

        const arnText = document.getElementById('arnText') ? document.getElementById('arnText').value.trim() : '';
        const arnMapping = parseArnText(arnText);

        calculateShippingTables(rawDataFiles, arnMapping);

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

function calculateShippingTables(rawDataFiles, arnMapping) {
    let poConfirmRows = []; // PO确认.xls 的数据
    let caPoRows = [];      // CA-PO.xls 的数据

    // 1. 智能拆分与识别上传的两个文件
    rawDataFiles.forEach(fileObj => {
        const rows = fileObj.data;
        if (!rows || rows.length === 0) return;

        const sampleKeys = Object.keys(rows[0]).map(k => k.trim().toLowerCase());
        if (sampleKeys.includes('ship-to location') || sampleKeys.includes('window start')) {
            poConfirmRows = poConfirmRows.concat(rows);
        } else {
            caPoRows = caPoRows.concat(rows);
        }
    });

    if (caPoRows.length === 0 && poConfirmRows.length > 0) {
        caPoRows = poConfirmRows;
    }

    // 2. 将 PO确认表 按照 `${PO}_${ASIN}` 建立字典索引
    const poConfirmMap = new Map();
    poConfirmRows.forEach(row => {
        const lowerRow = {};
        Object.keys(row).forEach(k => lowerRow[k.trim().toLowerCase()] = row[k]);

        const po = String(lowerRow['po'] || lowerRow['purchase order'] || lowerRow['po number'] || '').trim();
        const asin = String(lowerRow['asin'] || lowerRow['item'] || '').trim();

        if (po && asin) {
            const key = `${po}_${asin}`;
            poConfirmMap.set(key, {
                shipToLocation: lowerRow['ship-to location'] || lowerRow['destination'] || '',
                windowStart: lowerRow['window start'] || '',
                windowEnd: lowerRow['window end'] || ''
            });
        }
    });

    // 3. 构建初始校验数据表
    let initDataList = [];

    caPoRows.forEach(row => {
        const lowerRow = {};
        Object.keys(row).forEach(k => lowerRow[k.trim().toLowerCase()] = row[k]);

        const po = String(lowerRow['po'] || lowerRow['purchase order'] || lowerRow['po number'] || '').trim();
        const asin = String(lowerRow['asin'] || lowerRow['item'] || '').trim();
        const pcs = parseInt(lowerRow['pcs'] || lowerRow['quantity'] || lowerRow['qty'] || 0, 10);
        const confirmQty = parseInt(lowerRow['确认数量'] || lowerRow['accepted quantity'] || lowerRow['confirmed quantity'] || pcs, 10);
        const warehouse = String(lowerRow['仓库'] || lowerRow['warehouse'] || '').trim();

        const poKey = `${po}_${asin}`;
        const confirmInfo = poConfirmMap.get(poKey) || {};

        const shipToLocation = confirmInfo.shipToLocation || lowerRow['ship-to location'] || '';
        const windowStart = confirmInfo.windowStart || lowerRow['window start'] || '';
        const windowEnd = confirmInfo.windowEnd || lowerRow['window end'] || '';
        const expectedDate = calculateExpectedDate(windowStart, windowEnd);

        // 匹配箱规
        const spec = boxSpecs.find(s => s.asin === asin);
        const singlePcs = parseInt(lowerRow['单箱pcs'] || lowerRow['单箱 pcs'] || (spec ? spec.pcs : 0), 10);
        
        let cartons = parseInt(lowerRow['箱数'] || 0, 10);
        if (cartons <= 0 && singlePcs > 0) {
            cartons = Math.ceil(confirmQty / singlePcs);
        }

        let calculatedVol = 0;
        let calculatedWeight = 0;

        if (spec && cartons > 0) {
            calculatedVol = parseFloat((cartons * spec.vol).toFixed(2));
            calculatedWeight = parseFloat((cartons * spec.weight).toFixed(2));
        } else {
            calculatedVol = parseFloat(lowerRow['体积'] || 0);
            calculatedWeight = parseFloat(lowerRow['重量'] || 0);
        }

        const arn = arnMapping[po] || lowerRow['arn'] || lowerRow['shipment id'] || '';

        initDataList.push({
            'PO': po,
            'ASIN': asin,
            'PCS': pcs,
            '确认数量': confirmQty,
            '单箱PCS': singlePcs,
            '箱数': cartons,
            '体积': calculatedVol,
            '重量': calculatedWeight,
            '托盘': lowerRow['托盘'] || '',
            '仓库': warehouse,
            'Ship-to location': shipToLocation,
            'window start': windowStart,
            'window end': windowEnd,
            'Expected date': expectedDate,
            'ARN': arn
        });
    });

    // 4. 计算 表一：Shipment分配
    let table1Map = new Map();
    initDataList.forEach(item => {
        const key = `${item.ARN || 'UNASSIGNED'}_${item.PO}_${item.ASIN}`;
        if (!table1Map.has(key)) {
            table1Map.set(key, { ...item });
        } else {
            const existing = table1Map.get(key);
            existing.PCS += item.PCS;
            existing['确认数量'] += item['确认数量'];
            existing['箱数'] += item['箱数'];
            existing['体积'] = parseFloat((existing['体积'] + item['体积']).toFixed(2));
            existing['重量'] = parseFloat((existing['重量'] + item['重量']).toFixed(2));
        }
    });
    let table1List = Array.from(table1Map.values());

    // 5. 计算 表二：预约汇总
    let table2Map = new Map();
    initDataList.forEach(item => {
        const key = `${item.ARN || 'UNASSIGNED'}_${item['Ship-to location']}_${item['Expected date']}`;
        if (!table2Map.has(key)) {
            table2Map.set(key, {
                'ARN': item.ARN,
                'Ship-to location': item['Ship-to location'],
                'Expected date': item['Expected date'],
                '总确认数量': item['确认数量'],
                '总箱数': item['箱数'],
                '总体积': item['体积'],
                '总重量': item['重量'],
                '涉及PO列表': [item.PO]
            });
        } else {
            const existing = table2Map.get(key);
            existing['总确认数量'] += item['确认数量'];
            existing['总箱数'] += item['箱数'];
            existing['总体积'] = parseFloat((existing['总体积'] + item['体积']).toFixed(2));
            existing['总重量'] = parseFloat((existing['总重量'] + item['重量']).toFixed(2));
            if (!existing['涉及PO列表'].includes(item.PO)) {
                existing['涉及PO列表'].push(item.PO);
            }
        }
    });
    let table2List = Array.from(table2Map.values()).map(item => ({
        ...item,
        '涉及PO': item['涉及PO列表'].join(', ')
    }));
    table2List.forEach(item => delete item['涉及PO列表']);

    // 6. 计算 四表汇总 (按 ASIN 与 仓库 维度汇总)
    let summaryMap = new Map();
    initDataList.forEach(item => {
        const key = `${item.ASIN}_${item['Ship-to location']}`;
        if (!summaryMap.has(key)) {
            summaryMap.set(key, {
                'ASIN': item.ASIN,
                'Ship-to location': item['Ship-to location'],
                '总PCS': item.PCS,
                '总确认数量': item['确认数量'],
                '总箱数': item['箱数'],
                '总体积(cuft)': item['体积'],
                '总重量(lbs)': item['重量']
            });
        } else {
            const existing = summaryMap.get(key);
            existing['总PCS'] += item.PCS;
            existing['总确认数量'] += item['确认数量'];
            existing['总箱数'] += item['箱数'];
            existing['总体积(cuft)'] = parseFloat((existing['总体积(cuft)'] + item['体积']).toFixed(2));
            existing['总重量(lbs)'] = parseFloat((existing['总重量(lbs)'] + item['重量']).toFixed(2));
        }
    });
    let summaryList = Array.from(summaryMap.values());

    // 保存计算结果
    processedResult.initData = initDataList;
    processedResult.table1 = table1List;
    processedResult.table2 = table2List;
    processedResult.summary = summaryList;
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

    // 批量导入箱规事件监听
    const importFileInput = document.getElementById('importSpecFileInput');
    const btnImportSpecs = document.getElementById('btnImportSpecs');

    if (btnImportSpecs && importFileInput) {
        btnImportSpecs.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                importSpecsFromExcel(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // Tab 切换按钮绑定
    document.getElementById('btnTabSummary')?.addEventListener('click', (e) => switchTab('tabSummary', e.target));
    document.getElementById('btnTabTable1')?.addEventListener('click', (e) => switchTab('tabTable1', e.target));
    document.getElementById('btnTabTable2')?.addEventListener('click', (e) => switchTab('tabTable2', e.target));
    document.getElementById('btnTabInit')?.addEventListener('click', (e) => switchTab('tabInit', e.target));
});
