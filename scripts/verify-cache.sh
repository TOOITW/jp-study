#!/bin/bash

# IndexedDB 快取驗證輔助腳本
# 用途：快速檢查 dev server 和開啟測試頁面

echo "🚀 啟動 IndexedDB 快取驗證流程..."
echo ""

# 檢查 dev server 是否運行
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ Dev server 已在 port 3000 運行"
else
    echo "❌ Dev server 未運行，請先執行: npm run dev"
    exit 1
fi

echo ""
echo "📋 請按照以下步驟進行驗證："
echo ""
echo "1. 開啟測試頁面:"
echo "   http://localhost:3000/cache-test"
echo ""
echo "2. 開啟瀏覽器 Console (F12 → Console)"
echo ""
echo "3. 開啟 IndexedDB 檢查器 (F12 → Application → IndexedDB)"
echo ""
echo "4. 參考驗證清單:"
echo "   docs/cache-verification-checklist.md"
echo ""
echo "5. 測試建議順序:"
echo "   a. 檢查初始狀態（應為空）"
echo "   b. 儲存到快取（10 題）"
echo "   c. 重新整理頁面（快取持久化）"
echo "   d. 測試過期機制（8天前的快取）"
echo "   e. 清除快取"
echo "   f. 測試 /today 頁面整合"
echo ""

# macOS: 自動開啟瀏覽器
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 自動開啟瀏覽器..."
    open "http://localhost:3000/cache-test"
fi

echo ""
echo "📊 快速驗證命令："
echo ""
echo "  # 查看 Console 輸出"
echo "  → 在瀏覽器 Console 執行: console.log(await indexedDB.databases())"
echo ""
echo "  # 清除 IndexedDB（如需重置）"
echo "  → 在瀏覽器 Console 執行: indexedDB.deleteDatabase('jp-study-cache')"
echo ""

read -p "按 Enter 鍵繼續..."
