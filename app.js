// 默认箱规数据库
const DEFAULT_BOX_SPECS = [
    { name: "58英寸 420D牛津布PVC烧烤炉罩 黑色 UB", asin: "B0DSHYT2WX", pcsPerBox: 12, singleVol: 1.82, singleWeight: 43.34 },
    { name: "48英寸 420D牛津布PVC烧烤炉罩 黑色 UB", asin: "B0DSHXLGPS", pcsPerBox: 16, singleVol: 1.82, singleWeight: 44.44 },
    { name: "52英寸 420D牛津布PVC烧烤炉罩 黑色 UB", asin: "B0DSHY8X63", pcsPerBox: 14, singleVol: 1.82, singleWeight: 45.76 },
    { name: "55英寸 420D牛津布PVC烧烤炉罩 黑色 UB", asin: "B0DSHY7LTV", pcsPerBox: 14, singleVol: 1.82, singleWeight: 43.34 },
    { name: "60英寸 420D牛津布PVC烧烤炉罩 黑色 UB", asin: "B0DSHSYN2D", pcsPerBox: 12, singleVol: 1.82, singleWeight: 44.88 },
    { name: "套装 三脚架S 黑 I UB", asin: "B07837W5NX", pcsPerBox: 60, singleVol: 3.13, singleWeight: 39.38 },
    { name: "套装 三脚架PRO 黑 I UB", asin: "B06Y2VP3C7", pcsPerBox: 60, singleVol: 3.13, singleWeight: 38.28 },
    { name: "套装 四边形27x20英寸柔光箱 单温灯 SL21 UB 美规", asin: "B09XDMTYJL", pcsPerBox: 4, singleVol: 5.07, singleWeight: 38.5 },
    { name: "单套装 反折脚架+四边形16英寸柔光箱 单色温灯 UB 美规", asin: "B0CW17K3RK", pcsPerBox: 4, singleVol: 2.89, singleWeight: 19.93 },
    { name: "套装 四边形24x24英寸柔光箱 三色温灯 UB 美规", asin: "B0CXHNM23L", pcsPerBox: 4, singleVol: 4.19, singleWeight: 43.56 },
    { name: "套装 1.3米铁管 I +8寸方形摄影灯II 5色10片 UB", asin: "B08L4DB1CC", pcsPerBox: 12, singleVol: 2.85, singleWeight: 43.67 },
    { name: "套装 L型手机夹 I UB+蓝牙遥控器", asin: "B07SSZRXD5", pcsPerBox: 150, singleVol: 3.99, singleWeight: 22 },
    { name: "套装 L型磁吸手机夹I+蓝牙遥控 UB", asin: "B0CY4KW1ZM", pcsPerBox: 150, singleVol: 2.06, singleWeight: 220 },
    { name: "套装 WS67一体式自拍杆 黑色 UB", asin: "B0DSJ1KJ1W", pcsPerBox: 30, singleVol: 1.04, singleWeight: 22.55 },
    { name: "套装 67寸反折脚架+12寸塑料款+平板夹 UB", asin: "B0DM7VS2CV", pcsPerBox: 5, singleVol: 2.39, singleWeight: 18.04 },
    { name: "套装 20*20*4.5cm空气炸锅纸250PCS UB", asin: "B0DSVL2MCB", pcsPerBox: 24, singleVol: 4.26, singleWeight: 42.02 },
    { name: "套装 22*14*4.5cm空气炸锅纸250PCS UB", asin: "B0DSVMB6FH", pcsPerBox: 28, singleVol: 3, singleWeight: 47.3 },
    { name: "套装 虎口悬臂支架+10寸软管款 UB", asin: "B0CYT4KB4N", pcsPerBox: 10, singleVol: 4.63, singleWeight: 34.54 },
    { name: "套装 三脚架A 黑I UB", asin: "B088GNC6TT", pcsPerBox: 60, singleVol: 2.69, singleWeight: 34.1 },
    { name: "套装 62寸II +12寸触控款 UB", asin: "B08L5VKNWR", pcsPerBox: 5, singleVol: 2.64, singleWeight: 15.4 },
    { name: "套装 62寸II +12寸RGB五键线控款 UB", asin: "B0DSHGMQ6F", pcsPerBox: 5, singleVol: 2.45, singleWeight: 13.73 },
    { name: "套装 自拍脚架62寸 II UB", asin: "B07NWC3L95", pcsPerBox: 30, singleVol: 3.15, singleWeight: 46.2 },
    { name: "套装 自拍脚架67寸 II UB", asin: "B08D6KM95D", pcsPerBox: 25, singleVol: 2.93, singleWeight: 17.38 },
    { name: "套装 自拍脚架72寸 I UB", asin: "B0CSFT8MQW", pcsPerBox: 20, singleVol: 2.33, singleWeight: 33.66 },
    { name: "套装 反折脚架67英寸+38cm软管 黑色 UB", asin: "B0C6LNFHTP", pcsPerBox: 18, singleVol: 2, singleWeight: 43.78 },
    { name: "套装 62寸II +10寸触控款 UB", asin: "B089W6DSVX", pcsPerBox: 9, singleVol: 3.01, singleWeight: 43.34 },
    { name: "套装 67寸反折脚架+12寸磁吸触控款 UB", asin: "B0CZ3ZN62S", pcsPerBox: 5, singleVol: 2.24, singleWeight: 17.03 },
    { name: "套装 67寸反折脚架+14寸折叠触控款 UB", asin: "B0DSJ5MSKY", pcsPerBox: 10, singleVol: 3.84, singleWeight: 35.18 },
    { name: "72寸铁管脚架+60W 22寸环形灯 UB", asin: "B0DJ8RBX5N", pcsPerBox: 4, singleVol: 8.62, singleWeight: 44.75 },
    { name: "62寸脚架 12寸环形灯 UB", asin: "B07GDC39Y2", pcsPerBox: 5, singleVol: 2.33, singleWeight: 12.87 },
    { name: "套装 TR50 I +12寸塑料款 UB", asin: "B07QFV72LK", pcsPerBox: 5, singleVol: 2.51, singleWeight: 21.01 },
    { name: "套装 C72磁吸一体式自拍杆 黑色 UB", asin: "B0CY2NH57B", pcsPerBox: 30, singleVol: 2.4, singleWeight: 34.21 },
    { name: "XS64 方形磁吸一体式自拍杆 黑色 UB", asin: "B0D2R8X92Z", pcsPerBox: 34, singleVol: 1.58, singleWeight: 31.9 },
    { name: "套装 自拍脚架72英寸+38cm软管 黑色 UB", asin: "B0CSFW56YF", pcsPerBox: 20, singleVol: 2.3, singleWeight: 38.83 },
    { name: "套装 自研悬臂+16W 10寸全屏灯 UB", asin: "B0DC63991M", pcsPerBox: 10, singleVol: 4.33, singleWeight: 28.56 },
    { name: "XS64 方形磁吸一体式自拍杆 白色 UB", asin: "B0DNSPXC1Q", pcsPerBox: 34, singleVol: 1.58, singleWeight: 31.9 },
    { name: "套装 62寸反折脚架+12寸塑料俯拍款 UB", asin: "B0D2L98YNK", pcsPerBox: 4, singleVol: 2.31, singleWeight: 17.71 },
    { name: "套装 桌面俯拍+12寸塑料款 UB", asin: "B0FHV85QC6", pcsPerBox: 4, singleVol: 1.94, singleWeight: 20.72 }
];

let boxSpecDB = JSON.parse(localStorage.getItem("UB_BOX_SPECS")) || DEFAULT_BOX_SPECS;
let generatedResult = { initData: [], table1: [], table2Rows: [], summaryData: [] };

document.addEventListener("DOMContentLoaded", () => {
    renderSpecTable(boxSpecDB);
});

function saveDB() {
    localStorage.setItem("UB_BOX_SPECS", JSON.stringify(boxSpecDB));
    renderSpecTable(boxSpecDB);
}

function resetDefaultDB() {
    if (confirm("确定恢复为初始默认箱规数据库吗？自定义修改将被重置。")) {
        boxSpecDB = [...DEFAULT_BOX_SPECS];
        saveDB();
    }
}

function renderSpecTable(data) {
    const tbody = document.getElementById("specTableBody");
    tbody.innerHTML = "";
    data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="font-size:0.75rem; color:#666;">${item.name || "-"}</td>
            <td><b>${item.asin}</b></td>
            <td>${item.pcsPerBox}</td>
            <td>${item.singleVol}</td>
            <td>${item.singleWeight}</td>
            <td>
                <button class="btn btn-edit" onclick="editSpec('${item.asin}')">修改</button>
                <button class="btn btn-danger" onclick="deleteSpec('${item.asin}')">删除</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function searchBoxSpecs() {
    const keyword = document.getElementById("searchAsinInput").value.trim().toUpperCase();
    const filtered = boxSpecDB.filter(item => 
        item.asin.toUpperCase().includes(keyword) || (item.name && item.name.includes(keyword))
    );
    renderSpecTable(filtered);
}

let editingAsin = null;
function openAddSpecModal() {
    editingAsin = null;
    document.getElementById("modalTitle").innerText = "新增箱规";
    document.getElementById("modalName").value = "";
    document.getElementById("modalAsin").value = "";
    document.getElementById("modalAsin").disabled = false;
    document.getElementById("modalPcs").value = "";
    document.getElementById("modalVol").value = "";
    document.getElementById("modalWeight").value = "";
    document.getElementById("specModal").style.display = "flex";
}

function editSpec(asin) {
    const item = boxSpecDB.find(i => i.asin === asin);
    if (!item) return;
    editingAsin = asin;
    document.getElementById("modalTitle").innerText = "修改箱规 - " + asin;
    document.getElementById("modalName").value = item.name || "";
    document.getElementById("modalAsin").value = item.asin;
    document.getElementById("modalAsin").disabled = true;
    document.getElementById("modalPcs").value = item.pcsPerBox;
    document.getElementById("modalVol").value = item.singleVol;
    document.getElementById("modalWeight").value = item.singleWeight;
    document.getElementById("specModal").style.display = "flex";
}

function closeSpecModal() {
    document.getElementById("specModal").style.display = "none";
}

function saveSpec() {
    const name = document.getElementById("modalName").value.trim();
    const asin = document.getElementById("modalAsin").value.trim().toUpperCase();
    const pcsPerBox = parseInt(document.getElementById("modalPcs").value) || 0;
    const singleVol = parseFloat(document.getElementById("modalVol").value) || 0;
    const singleWeight = parseFloat(document.getElementById("modalWeight").value) || 0;

    if (!asin) return alert("请输入 ASIN！");

    if (editingAsin) {
        const item = boxSpecDB.find(i => i.asin === editingAsin);
        if (item) {
            item.name = name;
            item.pcsPerBox = pcsPerBox;
            item.singleVol = singleVol;
            item.singleWeight = singleWeight;
        }
    } else {
        if (boxSpecDB.some(i => i.asin === asin)) return alert("该 ASIN 已存在！");
        boxSpecDB.push({ name, asin, pcsPerBox, singleVol, singleWeight });
    }
    saveDB();
    closeSpecModal();
}

function deleteSpec(asin) {
    if (confirm(`确定删除 ASIN ${asin} 的箱规吗？`)) {
        boxSpecDB = boxSpecDB.filter(i => i.asin !== asin);
        saveDB();
    }
}

// 解析 ARN 文本
function parseArnText(text) {
    const arnMap = new Map();
    if (!text.trim()) return arnMap;
    // 正则匹配 Edit shipment X / POs: XXX / ARN: XXX
    const regex = /Edit shipment (\d+).*?Purchase orders \(POs\):\s*([\w]+).*?Shipment ID \(ARN\):\s*(\d+)/gs;
    let match;
    while ((match = regex.exec(text)) !== null) {
        const shipmentNo = match[1].trim();
        const po = match[2].trim();
        const arn = match[3].trim();
        arnMap.set(po, { shipmentNo, arn });
    }
    return arnMap;
}

// 核心计算处理（支持多文件导入 & 无 ARN 预生成）
async function processShippingData() {
    const fileInput = document.getElementById("excelFileInput");
    const arnText = document.getElementById("arnText").value;
    const arnMap = parseArnText(arnText);

    // 如果上传了新文件，重新解析文件；如果没选择新文件但已有计算结果，直接更新 ARN
    let allRawRows = [];

    if (fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            allRawRows = allRawRows.concat(jsonData);
        }
    } else if (generatedResult.initData.length > 0) {
        // 直接复用之前的数据，仅更新 ARN
        updateExistingArn(arnMap);
        return;
    } else {
        return alert("请选择 Amazon Vendor 表格文件！");
    }

    const specMap = new Map();
    boxSpecDB.forEach(s => specMap.set(s.asin.toUpperCase(), s));

    const initDataList = [];

    allRawRows.forEach(row => {
        const po = String(row["PO"] || "").trim();
        const asin = String(row["ASIN"] || "").trim().toUpperCase();
        const reqQty = parseFloat(row["PCS"] || row["Requested quantity"] || 0);
        const confirmQty = parseFloat(row["确认数量"] || reqQty);
        const shipTo = String(row["Ship-to location"] || "").trim();
        const warehouse = String(row["仓库"] || "").trim();
        const expDate = row["Expected date"] || row["Expected Date"] || "";
        const winStart = row["window start"] || "";
        const winEnd = row["window end"] || "";

        const spec = specMap.get(asin) || { pcsPerBox: 0, singleVol: 0, singleWeight: 0 };
        const boxNum = spec.pcsPerBox > 0 ? Math.ceil(confirmQty / spec.pcsPerBox) : 0;
        const totalVol = boxNum * spec.singleVol;
        const totalWeight = boxNum * spec.singleWeight;

        let palletNum = 0;
        if (boxNum > 10) {
            const byVol = Math.ceil(totalVol / 68.96);
            const byWeight = Math.ceil(totalWeight / 1400);
            palletNum = Math.max(byVol, byWeight);
        }

        initDataList.push({
            PO: po,
            ASIN: asin,
            品名: spec.name || row["品名"] || "0",
            PCS: reqQty,
            确认数量: confirmQty,
            单箱PCS: spec.pcsPerBox,
            箱数: boxNum,
            体积: totalVol,
            重量: totalWeight,
            托盘: palletNum,
            仓库: warehouse,
            "Ship-to location": shipTo,
            "window end": winEnd,
            "window start": winStart,
            "Expected date": expDate
        });
    });

    // 表一计算
    const table1Rows = [];
    initDataList.forEach((item, index) => {
        const rowObj = {
            "PO Number": item.PO,
            "PO Destination": item["Ship-to location"],
            "ASIN/ESKU": item.ASIN,
            Confirmed: item["确认数量"]
        };
        initDataList.forEach((colItem, cIdx) => {
            rowObj[`Shipment ${cIdx + 1}`] = cIdx === index ? item["确认数量"] : 0;
        });
        table1Rows.push(rowObj);
    });

    // 表二计算
    const table2Rows = initDataList.map((item, index) => {
        const spec = specMap.get(item.ASIN) || { singleVol: 0, singleWeight: 0 };
        const arnInfo = arnMap.get(item.PO) || { shipmentNo: index + 1, arn: "" };

        return {
            "提货日期": item["Expected date"],
            "PO-ASIN": item.PO + item.ASIN,
            "window start": item["window start"],
            "window end": item["window end"],
            "shipment编号": arnInfo.shipmentNo,
            "ARN": arnInfo.arn,
            "PO": item.PO,
            "ASIN": item.ASIN,
            "PCS": item.PCS,
            "确认数量": item["确认数量"],
            "单箱PCS": item.单箱PCS,
            "箱数": item.箱数,
            "箱唛序列": "",
            "箱唛序列图片": "",
            "体积": item.体积.toFixed(8),
            "重量": item.重量.toFixed(2),
            "托盘": item.托盘,
            "仓库": item.仓库,
            "Ship-to location": item["Ship-to location"],
            "单箱体积": spec.singleVol.toFixed(8),
            "单箱重量": spec.singleWeight.toFixed(8)
        };
    });

    // 汇总总表
    const summaryData = [...table2Rows];

    generatedResult = {
        initData: initDataList,
        table1: table1Rows,
        table2Rows: table2Rows,
        summaryData: summaryData
    };

    renderHtmlTable(summaryData, "tableSummary");
    renderHtmlTable(table1Rows, "table1");
    renderHtmlTable(table2Rows, "table2");
    renderHtmlTable(initDataList, "tableInit");

    document.getElementById("resultCard").style.display = "block";
    document.getElementById("downloadAllBtn").style.display = "inline-block";

    if (arnMap.size > 0) {
        alert("🎉 数据计算完成，并成功匹配提取 ARN 数据！");
    } else {
        alert("🎉 数据计算完成！已生成表一、表二及初始校验数据。\n若后续获取了 ARN 文本，可直接粘贴并再次点击更新。");
    }
}

// 仅更新 ARN 逻辑
function updateExistingArn(arnMap) {
    if (!generatedResult.table2Rows.length) return;

    generatedResult.table2Rows.forEach((row, index) => {
        const arnInfo = arnMap.get(row.PO) || { shipmentNo: index + 1, arn: "" };
        row["shipment编号"] = arnInfo.shipmentNo;
        row["ARN"] = arnInfo.arn;
    });

    generatedResult.summaryData = [...generatedResult.table2Rows];

    renderHtmlTable(generatedResult.summaryData, "tableSummary");
    renderHtmlTable(generatedResult.table2Rows, "table2");

    alert("✅ ARN 提货信息已成功更新补充到表二与总表中！");
}

function renderHtmlTable(data, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = "";
    if (!data || !data.length) return;

    const table = document.createElement("table");
    const headers = Object.keys(data[0]);

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach(row => {
        const tr = document.createElement("tr");
        headers.forEach(h => {
            const td = document.createElement("td");
            td.textContent = row[h] !== undefined ? row[h] : "";
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}

function switchTab(tabId, btn) {
    document.querySelectorAll(".tab-content").forEach(el => el.style.display = "none");
    document.querySelectorAll(".tab-btn").forEach(el => el.classList.remove("active"));
    document.getElementById(tabId).style.display = "block";
    btn.classList.add("active");
}

function exportAllTablesToExcel() {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generatedResult.summaryData), "总表");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generatedResult.table1), "表一");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generatedResult.table2Rows), "表二");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(generatedResult.initData), "初始数据");
    XLSX.writeFile(wb, "货件协同四表汇总结果.xlsx");
}

function exportSpecsToExcel() {
    const ws = XLSX.utils.json_to_sheet(boxSpecDB);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "箱规数据库");
    XLSX.writeFile(wb, "箱规数据库备份.xlsx");
}
