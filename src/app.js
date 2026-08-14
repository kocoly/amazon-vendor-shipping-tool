// ==========================================
// 1. 常量定义与箱规数据库管理
// ==========================================
const PALLET_VOL_CANADA = 68.96;       // 加拿大标准托盘容积 (cuFt)
const MAX_WEIGHT_PER_PALLET = 1400;     // 单托盘最大载重 (lbs)

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

function importSpecsFromExcel(file) {
    if (typeof XLSX === 'undefined') return alert('SheetJS 库未加载，无法解析 Excel');

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

            if (jsonData.length === 0) return alert('导入的文件中没有找到有效数据！');

            let successCount = 0;
            let updateCount = 0;

            jsonData.forEach(row => {
                const lowerRow = {};
                Object.keys(row).forEach(k => lowerRow[k.trim().toLowerCase()] = row[k]);

                const asin = String(lowerRow['asin'] || '').trim();
                const name = String(lowerRow['name'] || lowerRow['品名'] || lowerRow['品名描述'] || '').trim();
                const pcs = parseInt(lowerRow['pcs'] || lowerRow['单箱 pcs'] || lowerRow['单箱pcs'] || 0, 10);
                const vol = parseFloat(lowerRow['vol'] || lowerRow['单箱体积 (cuft)'] || lowerRow['单箱体积'] || 0);
                const weight = parseFloat(lowerRow['weight'] || lowerRow['单箱重量 (lbs)'] || lowerRow['单箱重量'] || 0);

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
// 2. 辅助计算与日期工具 (解析 Excel 序列号 & 推算首个周四)
// ==========================================

/**
 * 将 Excel 序列号 (如 46195) 或文本格式解析为 JS Date 对象
 */
function parseExcelDate(val) {
    if (!val) return null;
    
    if (typeof val === 'number' || (!isNaN(val) && !String(val).includes('-') && !String(val).includes('/'))) {
        const num = Number(val);
        const utc_days  = Math.floor(num - 25569);
        const utc_value = utc_days * 86400;
        const date_info = new Date(utc_value * 1000);
        return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate());
    }

    const parsedStr = String(val).replace(/\./g, '/').replace(/-/g, '/');
    const d = new Date(parsedStr);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * 自动在 Window Start 至 Window End 范围内寻找第一个周四
 */
function calculateExpectedThursday(windowStartVal, windowEndVal) {
    const start = parseExcelDate(windowStartVal);
    const end = parseExcelDate(windowEndVal);

    if (!start || !end || start > end) return '';

    let curr = new Date(start);
    while (curr <= end) {
        if (curr.getDay() === 4) {
            const y = curr.getFullYear();
            const m = curr.getMonth() + 1;
            const d = curr.getDate();
            return `${y}/${m}/${d}`;
        }
        curr.setDate(curr.getDate() + 1);
    }

    return '';
}

/**
 * 复刻托盘计算逻辑
 */
function calculatePallets(cartonCount, totalVol, totalWt) {
    if (cartonCount <= 10) return 0;
    const palletsByVol = Math.ceil(totalVol / PALLET_VOL_CANADA);
    const palletsByWt = Math.ceil(totalWt / MAX_WEIGHT_PER_PALLET);
    return Math.max(palletsByVol, palletsByWt);
}

// ==========================================
// 3. 核心数据协同与匹配引擎
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

        if (document.getElementById('resultCard')) document.getElementById('resultCard').style.display = 'block';
        if (document.getElementById('downloadAllBtn')) document.getElementById('downloadAllBtn').style.display = 'inline-flex';

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

/**
 * ⚡ 高级亚马逊后台 ARN 文本解析器
 * 完美支持多 PO (如 "2ZQD4VQA and 8P8T16JU")、跨行文本解析
 */
function parseArnText(text) {
    const map = {};
    if (!text || !text.trim()) return map;

    // 按 "Edit shipment" 分块解析
    const blocks = text.split(/Edit shipment/i);

    blocks.forEach(block => {
        if (!block.trim()) return;

        // 提取 ARN 编号 (例如: Shipment ID (ARN): 44526607291 created)
        const arnMatch = block.match(/Shipment ID \(ARN\):\s*([A-Za-z0-9]+)/i);
        const arn = arnMatch ? arnMatch[1].trim() : '';

        // 提取 Purchase orders (POs): 后续文本行
        const poSectionMatch = block.match(/Purchase orders \(POs\):([^\n\r]+)/i);

        if (arn && poSectionMatch) {
            const poStr = poSectionMatch[1];
            // 提取该行中所有的 8 位英数字 PO 编号
            const matchedPOs = poStr.match(/[A-Z0-9]{8}/g);
            if (matchedPOs) {
                matchedPOs.forEach(po => {
                    map[po] = arn;
                });
            }
        }
    });

    return map;
}

function calculateShippingTables(rawDataFiles, arnMapping) {
    let poConfirmRows = [];
    let caPoRows = [];

    // 第一步：分类 PO确认 表和 CA-PO 表
    rawDataFiles.forEach(fileObj => {
        const rows = fileObj.data;
        if (!rows || rows.length === 0) return;

        const firstRowKeys = Object.keys(rows[0]).map(k => k.trim().toLowerCase());
        const isConfirmTable = firstRowKeys.some(k => k.includes('ship-to') || k.includes('window start') || k.includes('window end'));

        if (isConfirmTable) {
            poConfirmRows = poConfirmRows.concat(rows);
        } else {
            caPoRows = caPoRows.concat(rows);
        }
    });

    if (caPoRows.length === 0 && poConfirmRows.length > 0) {
        caPoRows = poConfirmRows;
    }

    // 第二步：构建 PO确认 Lookup Map
    const poConfirmLookup = new Map();
    poConfirmRows.forEach(row => {
        const lowerRow = {};
        Object.keys(row).forEach(k => lowerRow[k.trim().toLowerCase()] = row[k]);

        const po = String(lowerRow['po'] || lowerRow['purchase order'] || lowerRow['po number'] || '').trim();
        const asin = String(lowerRow['asin'] || lowerRow['item'] || lowerRow['asin/msku'] || '').trim();
        const shipTo = String(lowerRow['ship-to location'] || lowerRow['destination'] || lowerRow['po destination'] || lowerRow['ship-to'] || '').trim();
        const wStart = lowerRow['window start'] || '';
        const wEnd = lowerRow['window end'] || '';

        if (po) {
            const key = asin ? `${po}_${asin}` : po;
            poConfirmLookup.set(key, { shipToLocation: shipTo, windowStart: wStart, windowEnd: wEnd });
            if (!poConfirmLookup.has(po)) {
                poConfirmLookup.set(po, { shipToLocation: shipTo, windowStart: wStart, windowEnd: wEnd });
            }
        }
    });

    // 第三步：规范化原始数据
    let normalizedRows = [];
    caPoRows.forEach((row, index) => {
        const lowerRow = {};
        Object.keys(row).forEach(k => lowerRow[k.trim().toLowerCase()] = row[k]);

        const po = String(lowerRow['po'] || lowerRow['purchase order'] || lowerRow['po number'] || '').trim();
        const asin = String(lowerRow['asin'] || lowerRow['item'] || lowerRow['asin/msku'] || '').trim();

        if (!po && !asin) return;

        const lookupKey = `${po}_${asin}`;
        const confirmInfo = poConfirmLookup.get(lookupKey) || poConfirmLookup.get(po) || {};

        const shipToLocation = confirmInfo.shipToLocation || String(lowerRow['ship-to location'] || lowerRow['po destination'] || '').trim();
        const windowStart = confirmInfo.windowStart || lowerRow['window start'] || '';
        const windowEnd = confirmInfo.windowEnd || lowerRow['window end'] || '';
        const expectedThursday = calculateExpectedThursday(windowStart, windowEnd);

        const confirmQty = parseInt(lowerRow['确认数量'] || lowerRow['accepted quantity'] || lowerRow['confirmed'] || lowerRow['pcs'] || lowerRow['quantity'] || 0, 10);
        const pickUpLoc = String(lowerRow['仓库'] || lowerRow['warehouse'] || lowerRow['pick up location'] || '').trim();

        const spec = boxSpecs.find(s => s.asin === asin);
        const singlePcs = parseInt(lowerRow['单箱pcs'] || lowerRow['单箱 pcs'] || (spec ? spec.pcs : 0), 10);
        const singleVol = spec ? spec.vol : parseFloat(lowerRow['单箱体积'] || 0);
        const singleWeight = spec ? spec.weight : parseFloat(lowerRow['单箱重量'] || 0);

        let cartons = parseInt(lowerRow['箱数'] || lowerRow['cartons'] || 0, 10);
        if (cartons <= 0 && singlePcs > 0) {
            cartons = Math.ceil(confirmQty / singlePcs);
        }

        let calculatedVol = 0;
        let calculatedWeight = 0;

        if (spec && cartons > 0) {
            calculatedVol = parseFloat((cartons * spec.vol).toFixed(2));
            calculatedWeight = parseFloat((cartons * spec.weight).toFixed(2));
        } else {
            calculatedVol = parseFloat(lowerRow['体积'] || lowerRow['total volume (cuft.)'] || 0);
            calculatedWeight = parseFloat(lowerRow['重量'] || lowerRow['total weight (lbs.)'] || 0);
        }

        normalizedRows.push({
            rowIndex: index + 2,
            po,
            asin,
            confirmQty,
            pickUpLoc,
            poDestination: shipToLocation,
            windowStart: windowStart ? (parseExcelDate(windowStart)?.toLocaleDateString() || String(windowStart)) : '',
            windowEnd: windowEnd ? (parseExcelDate(windowEnd)?.toLocaleDateString() || String(windowEnd)) : '',
            expectedDate: expectedThursday,
            cartons,
            singlePcs,
            singleVol,
            singleWeight,
            calculatedVol,
            calculatedWeight
        });
    });

    // ⚡【完全对齐 Excel 顺序】：主排序 = PO 升序，次排序 = ASIN 降序
    normalizedRows.sort((a, b) => {
        const poCompare = a.po.localeCompare(b.po); // 1. 先按 PO 升序
        if (poCompare !== 0) return poCompare;
        return b.asin.localeCompare(a.asin);         // 2. PO 相同时，按 ASIN 降序
    });

    // 第四步： Shipment 分组合并 (核心逻辑改动：锁定 sName 始终为 Shipment X 格式)
    let shipmentMap = new Map();
    let shipmentCount = 0;

    normalizedRows.forEach(row => {
        const realArn = arnMapping[row.po];
        // 逻辑分组依据：如果获取到了 ARN 则按 ARN 分组，否则按 仓库+目的地 分组
        let shipmentKey = realArn ? `ARN_${realArn}` : `${row.pickUpLoc}||${row.poDestination}`;

        if (!shipmentMap.has(shipmentKey)) {
            shipmentCount++;
            // 💡 关键改动：无论是否有 ARN，名称永远保持为 Shipment 1, Shipment 2 ...
            const sName = `Shipment ${shipmentCount}`;
            shipmentMap.set(shipmentKey, {
                id: shipmentCount,
                name: sName,
                arn: realArn || '',
                poDestination: row.poDestination,
                pickUpLoc: row.pickUpLoc,
                expectedDate: row.expectedDate,
                items: []
            });
        }

        const currentShipment = shipmentMap.get(shipmentKey);
        row.shipmentNumber = currentShipment.id;
        row.shipmentName = currentShipment.name;
        row.arn = currentShipment.arn;
        if (!currentShipment.expectedDate && row.expectedDate) {
            currentShipment.expectedDate = row.expectedDate;
        }
        currentShipment.items.push(row);
    });

    const allShipments = Array.from(shipmentMap.values()).map(s => s.name);

    // 第五步：构建【表一】矩阵分配表
    let table1List = [];
    normalizedRows.forEach(row => {
        let rowObj = {
            'PO Number': row.po,
            'PO Destination': row.poDestination,
            'ASIN/MSKU': row.asin,
            'Confirmed': row.confirmQty
        };

        allShipments.forEach(sName => {
            rowObj[sName] = (row.shipmentName === sName) ? row.confirmQty : 0;
        });

        table1List.push(rowObj);
    });

    // 第六步：构建【表二】预约转置汇总表
    let table2Transposed = [
        { 'Input': 'Desination:' },
        { 'Input': 'Ship ASIN' },
        { 'Input': 'Total Units:' },
        { 'Input': 'Requested pick up date' },
        { 'Input': 'Pick up location' },
        { 'Input': 'Stacked pallets' },
        { 'Input': 'Unstacked pallets' },
        { 'Input': 'Cartons' },
        { 'Input': 'Total weight (lbs.)' },
        { 'Input': 'Total volume (cuFt.)' },
        { 'Input': 'Shipment reference number (optional)' }
    ];

    shipmentMap.forEach(shipment => {
        let totalUnits = 0;
        let totalCartons = 0;
        let totalWeight = 0;
        let totalVolume = 0;
        let asinSet = new Set();

        shipment.items.forEach(item => {
            totalUnits += item.confirmQty;
            totalCartons += item.cartons;
            totalWeight += item.calculatedWeight;
            totalVolume += item.calculatedVol;
            if (item.asin) asinSet.add(item.asin);
        });

        const sortedAsins = Array.from(asinSet).sort((a, b) => b.localeCompare(a));
        const unstackedPallets = calculatePallets(totalCartons, totalVolume, totalWeight);
        const colName = shipment.name;

        table2Transposed[0][colName] = shipment.poDestination;
        table2Transposed[1][colName] = sortedAsins.join(', ');
        table2Transposed[2][colName] = totalUnits;
        table2Transposed[3][colName] = shipment.expectedDate;
        table2Transposed[4][colName] = shipment.pickUpLoc;
        table2Transposed[5][colName] = ''; 
        table2Transposed[6][colName] = unstackedPallets;
        table2Transposed[7][colName] = totalCartons;
        table2Transposed[8][colName] = parseFloat(totalWeight.toFixed(2));
        table2Transposed[9][colName] = parseFloat(totalVolume.toFixed(2));
        table2Transposed[10][colName] = shipment.name;
    });

    // 第七步：构建【总表】（完全匹配图片的 21 列完整排版）
    processedResult.summary = normalizedRows.map(r => {
        const palletCount = calculatePallets(r.cartons, r.calculatedVol, r.calculatedWeight);
        return {
            '提货日期': r.expectedDate,
            'PO-ASIN': `${r.po}${r.asin}`,
            'window start': r.windowStart,
            'window end': r.windowEnd,
            'shipment编号': r.shipmentNumber,
            'ARN': r.arn || '',
            'PO': r.po,
            'ASIN': r.asin,
            'PCS': r.confirmQty,
            '确认数量': r.confirmQty,
            '单箱PCS': r.singlePcs,
            '箱数': r.cartons,
            '箱唛序列': '',
            '箱唛序列图片': '',
            '体积': r.calculatedVol,
            '重量': r.calculatedWeight,
            '托盘': palletCount,
            '仓库': r.pickUpLoc,
            'Ship-to location': r.poDestination,
            '单箱体积': r.singleVol,
            '单箱重量': r.singleWeight
        };
    });

    // 还原【初始校验数据】：保持标准校验数据样式，Shipment 同样列出标准命名
    processedResult.initData = normalizedRows.map(r => ({
        'PO': r.po,
        'ASIN': r.asin,
        '确认数量': r.confirmQty,
        '箱数': r.cartons,
        '体积': r.calculatedVol,
        '重量': r.calculatedWeight,
        '仓库': r.pickUpLoc,
        'Ship-to location': r.poDestination,
        'window start': r.windowStart,
        'window end': r.windowEnd,
        'Expected date': r.expectedDate,
        'Shipment': r.shipmentName
    }));

    // 保存最终数据表
    processedResult.table1 = table1List;
    processedResult.table2 = table2Transposed;
}

// ==========================================
// 4. Tab 切换与 UI 表格渲染
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
    let html = '<table style="white-space: pre-line;"><thead><tr>';
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
    if (processedResult.summary.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.summary), "总表");
    if (processedResult.table1.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.table1), "表一_Shipment分配");
    if (processedResult.table2.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.table2), "表二_预约汇总");
    if (processedResult.initData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.initData), "初始校验数据");

    XLSX.writeFile(wb, "Amazon_Vendor_货件协同结果.xlsx");
}

// ==========================================
// 5. 事件监听器初始化
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderSpecTable();

    document.getElementById('btnProcess')?.addEventListener('click', processShippingData);
    document.getElementById('downloadAllBtn')?.addEventListener('click', exportAllTablesToExcel);

    document.getElementById('searchAsinInput')?.addEventListener('input', searchBoxSpecs);
    document.getElementById('btnAddSpec')?.addEventListener('click', openAddSpecModal);
    document.getElementById('btnResetDB')?.addEventListener('click', resetDefaultDB);
    document.getElementById('btnExportSpecs')?.addEventListener('click', exportSpecsToExcel);
    document.getElementById('btnCloseModal')?.addEventListener('click', closeSpecModal);
    document.getElementById('btnSaveSpec')?.addEventListener('click', saveSpec);

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

    document.getElementById('btnTabSummary')?.addEventListener('click', (e) => switchTab('tabSummary', e.target));
    document.getElementById('btnTabTable1')?.addEventListener('click', (e) => switchTab('tabTable1', e.target));
    document.getElementById('btnTabTable2')?.addEventListener('click', (e) => switchTab('tabTable2', e.target));
    document.getElementById('btnTabInit')?.addEventListener('click', (e) => switchTab('tabInit', e.target));
});
