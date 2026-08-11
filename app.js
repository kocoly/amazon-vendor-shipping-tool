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
                <button class="btn btn-edit" onclick="window.openEditSpecModal('${item.asin}')">编辑</button>
                <button class="btn btn-danger" onclick="window.deleteSpec('${item.asin}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.searchBoxSpecs = function() {
    const query = document.getElementById('searchAsinInput').value.toLowerCase().trim();
    const filtered = boxSpecs.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) || 
        item.asin.toLowerCase().includes(query)
    );
    renderSpecTable(filtered);
};

window.openAddSpecModal = function() {
    editingAsin = null;
    document.getElementById('modalTitle').innerText = '新增箱规';
    document.getElementById('modalName').value = '';
    document.getElementById('modalAsin').value = '';
    document.getElementById('modalAsin').disabled = false;
    document.getElementById('modalPcs').value = '';
    document.getElementById('modalVol').value = '';
    document.getElementById('modalWeight').value = '';
    document.getElementById('specModal').style.display = 'flex';
};

window.openEditSpecModal = function(asin) {
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
};

window.closeSpecModal = function() {
    document.getElementById('specModal').style.display = 'none';
};

window.saveSpec = function() {
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
    window.closeSpecModal();
};

window.deleteSpec = function(asin) {
    if (confirm(`确定要删除 ASIN: ${asin} 的箱规配置吗？`)) {
        boxSpecs = boxSpecs.filter(item => item.asin !== asin);
        saveSpecsToStorage();
        renderSpecTable();
    }
};

window.resetDefaultDB = function() {
    if (confirm('确定要重置箱规数据库吗？')) {
        boxSpecs = [...DEFAULT_SPECS];
        saveSpecsToStorage();
        renderSpecTable();
    }
};

window.exportSpecsToExcel = function() {
    if (typeof XLSX === 'undefined') return alert('SheetJS 组件尚未完成加载');
    const ws = XLSX.utils.json_to_sheet(boxSpecs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "箱规数据库");
    XLSX.writeFile(wb, "Vendor_Box_Specs.xlsx");
};

// ==========================================
// 2. 货件协同数据核心算法
// ==========================================
let processedResult = { summary: [], table1: [], table2: [], initData: [] };

window.processShippingData = async function() {
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
};

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
// 3. UI 渲染与 Tab 切换 (已解决 appendChild 报错)
// ==========================================
window.switchTab = function(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    
    const target = document.getElementById(tabId);
    if (target) target.style.display = 'block';
    if (btn) btn.classList.add('active');
};

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
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

window.exportAllTablesToExcel = function() {
    if (typeof XLSX === 'undefined') return alert('SheetJS 库未加载');
    const wb = XLSX.utils.book_new();
    if (processedResult.summary.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.summary), "四表汇总");
    if (processedResult.table1.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.table1), "表一_Shipment分配");
    if (processedResult.table2.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.table2), "表二_预约汇总");
    if (processedResult.initData.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(processedResult.initData), "初始校验数据");

    XLSX.writeFile(wb, "Amazon_Vendor_货件协同结果.xlsx");
};

window.onload = function() {
    renderSpecTable();
};
