import React, { useState } from 'react';

const PromptGenerator = () => {
  const [formData, setFormData] = useState({
    className: '',
    directory: '',
    description: ''
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const promptTemplate = `Bạn là chuyên gia phát triển Revit add-in bằng C# với kinh nghiệm sâu về Autodesk.Revit API. Hãy tạo một External Command cho dự án SimpleBIM với các yêu cầu sau:

=============================================================================
THÔNG TIN CƠ BẢN
=============================================================================
- Tên Class: [Door]
- Thư mục: [DIRECTORY]
- Mô tả tính năng: [DESCRIPTION]

=============================================================================
⚠️ CRITICAL: DANH SÁCH ASSEMBLIES CÓ SẴN (CHỈ DÙNG NHỮNG GÌ LIỆT KÊ)
=============================================================================

Project SimpleBIM CHỈ có sẵn các assemblies sau. KHÔNG ĐƯỢC sử dụng bất kỳ 
thư viện nào ngoài danh sách này:

### REVIT API (Có sẵn từ Revit SDK):
- RevitAPI.dll → Autodesk.Revit.DB.*, Autodesk.Revit.DB.Architecture, 
  Autodesk.Revit.DB.Plumbing, Autodesk.Revit.DB.Mechanical, 
  Autodesk.Revit.DB.Electrical, Autodesk.Revit.DB.Structure
- RevitAPIUI.dll → Autodesk.Revit.UI.*, Autodesk.Revit.UI.Selection

### .NET FRAMEWORK 4.8 (Standard Libraries):
- System.dll
- System.Core.dll (LINQ)
- System.Windows.Forms.dll (Chỉ các controls cơ bản - xem danh sách bên dưới)
- System.Drawing.dll
- System.Data.dll
- System.Xml.dll
- System.IO.dll
- mscorlib.dll

### THIRD-PARTY ĐÃ INCLUDE TRONG PROJECT:
- Newtonsoft.Json.dll (JSON serialization)

=============================================================================
⛔ BLACKLIST - CÁC THƯ VIỆN KHÔNG ĐƯỢC SỬ DỤNG (SẼ GÂY LỖI COMPILE)
=============================================================================

TUYỆT ĐỐI KHÔNG SỬ DỤNG các namespaces/classes sau:

### ❌ CHARTS & DATA VISUALIZATION:
- System.Windows.Forms.DataVisualization (KHÔNG CÓ SẴN)
- System.Windows.Forms.DataVisualization.Charting (KHÔNG CÓ SẴN)
- Chart, ChartArea, Series, Legend, ChartValueType, SeriesChartType (KHÔNG TỒN TẠI)
- LiveCharts, OxyPlot, ScottPlot (external libraries)

### ❌ EXCEL/OFFICE INTEROP:
- Microsoft.Office.Interop.Excel (cần cài Office)
- Microsoft.Office.Interop.Word
- NPOI, EPPlus, ClosedXML (external libraries)
- DocumentFormat.OpenXml (external)

### ❌ WPF (Revit plugin nên dùng WinForms):
- System.Windows.Controls
- PresentationFramework
- PresentationCore
- WindowsBase (trừ khi cần XYZ utilities)

### ❌ DATABASE:
- System.Data.SqlClient
- System.Data.Entity
- EntityFramework
- Dapper

### ❌ NETWORK/WEB:
- System.Net.Http.HttpClient (dùng WebClient thay thế nếu cần)
- RestSharp
- Newtonsoft.Json.Linq (chỉ dùng Newtonsoft.Json cơ bản)

### ❌ ASYNC/PARALLEL NÂNG CAO:
- System.Threading.Tasks.Dataflow
- Async/await patterns phức tạp (Revit API không thread-safe)

=============================================================================
✅ WINFORMS CONTROLS CÓ SẴN (CHỈ DÙNG NHỮNG CONTROLS NÀY)
=============================================================================

Khi tạo WinForms UI, CHỈ sử dụng các controls sau:

### CONTAINERS:
- Form, Panel, GroupBox, TabControl, TabPage, SplitContainer, FlowLayoutPanel, 
  TableLayoutPanel

### INPUT CONTROLS:
- Button, TextBox, RichTextBox, MaskedTextBox, ComboBox, ListBox, CheckBox, 
  RadioButton, NumericUpDown, DateTimePicker, TrackBar, CheckedListBox

### DISPLAY CONTROLS:
- Label, LinkLabel, PictureBox, ProgressBar, ListView, TreeView, DataGridView,
  StatusStrip, ToolStrip, MenuStrip, ContextMenuStrip

### DIALOGS:
- MessageBox, OpenFileDialog, SaveFileDialog, FolderBrowserDialog, 
  ColorDialog, FontDialog

### ⚠️ KHÔNG CÓ SẴN (PHẢI TỰ VẼ):
- Chart (tự vẽ bằng Graphics/GDI+)
- Gauge, Meter, Dashboard controls
- Ribbon controls

=============================================================================
🔄 THAY THẾ CHO TÍNH NĂNG KHÔNG CÓ SẴN
=============================================================================

### Thay thế CHART/VISUALIZATION:
csharp
// THAY VÌ: System.Windows.Forms.DataVisualization.Charting.Chart
// DÙNG: Custom Panel với GDI+ drawing

public class SimpleBarChart : Panel
{
    private List<(string Label, double Value)> _data = new List<(string, double)>();
    private Drawing.Color _barColor = Drawing.Color.SteelBlue;

    public void SetData(List<(string Label, double Value)> data)
    {
        _data = data;
        Invalidate(); // Trigger repaint
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        if (_data.Count == 0) return;

        Graphics g = e.Graphics;
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

        int padding = 40;
        int chartWidth = Width - padding * 2;
        int chartHeight = Height - padding * 2;
        double maxValue = _data.Max(d => d.Value);
        if (maxValue == 0) maxValue = 1;

        int barWidth = chartWidth / _data.Count - 10;
        if (barWidth < 20) barWidth = 20;

        using (var brush = new SolidBrush(_barColor))
        using (var pen = new Pen(Drawing.Color.Black))
        using (var font = new Font("Segoe UI", 8))
        using (var fontSmall = new Font("Segoe UI", 7))
        {
            // Draw axis
            g.DrawLine(pen, padding, padding, padding, Height - padding);
            g.DrawLine(pen, padding, Height - padding, Width - padding, Height - padding);

            for (int i = 0; i < _data.Count; i++)
            {
                int x = padding + i * (barWidth + 10) + 5;
                int barHeight = (int)((_data[i].Value / maxValue) * chartHeight);
                int y = Height - padding - barHeight;

                // Draw bar
                g.FillRectangle(brush, x, y, barWidth, barHeight);
                g.DrawRectangle(pen, x, y, barWidth, barHeight);

                // Draw value on top
                string valueText = _data[i].Value.ToString("F1");
                var valueSize = g.MeasureString(valueText, fontSmall);
                g.DrawString(valueText, fontSmall, Brushes.Black, 
                    x + (barWidth - valueSize.Width) / 2, y - valueSize.Height - 2);

                // Draw label below
                var labelSize = g.MeasureString(_data[i].Label, font);
                g.DrawString(_data[i].Label, font, Brushes.Black,
                    x + (barWidth - labelSize.Width) / 2, Height - padding + 5);
            }
        }
    }
}


### Thay thế EXCEL EXPORT:
csharp
// THAY VÌ: Microsoft.Office.Interop.Excel hoặc EPPlus
// DÙNG: CSV export (có thể mở bằng Excel)

private void ExportToCsv(List<MaterialData> data, string filePath)
{
    using (StreamWriter sw = new StreamWriter(filePath, false, Encoding.UTF8))
    {
        // BOM for UTF-8 to ensure Excel reads Vietnamese correctly
        sw.WriteLine("Material Name,Volume (m³),Area (m²),Unit Cost,Total Cost");
        
        double totalCost = 0;
        foreach (var item in data)
        {
            // Escape CSV values
            string name = EscapeCsvValue(item.Name);
            sw.WriteLine($"{name},{item.Volume:F3},{item.Area:F3},{item.UnitCost:F2},{item.TotalCost:F2}");
            totalCost += item.TotalCost;
        }
        
        // Total row
        sw.WriteLine($"TOTAL,,,, {totalCost:F2}");
    }
}

private string EscapeCsvValue(string value)
{
    if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
    {
        return "\"" + value.Replace("\"", "\"\"") + "\"";
    }
    return value;
}

// Mở file sau khi export
Process.Start(new ProcessStartInfo(filePath) { UseShellExecute = true });


### Thay thế PIE CHART:
csharp
// Custom Pie Chart using GDI+
public class SimplePieChart : Panel
{
    private List<(string Label, double Value, Drawing.Color Color)> _data = 
        new List<(string, double, Drawing.Color)>();

    public void SetData(List<(string Label, double Value)> data)
    {
        var colors = new Drawing.Color[] {
            Drawing.Color.FromArgb(70, 130, 180),  // Steel Blue
            Drawing.Color.FromArgb(60, 179, 113),  // Medium Sea Green
            Drawing.Color.FromArgb(255, 165, 0),   // Orange
            Drawing.Color.FromArgb(220, 20, 60),   // Crimson
            Drawing.Color.FromArgb(138, 43, 226),  // Blue Violet
            Drawing.Color.FromArgb(64, 224, 208),  // Turquoise
            Drawing.Color.FromArgb(255, 215, 0),   // Gold
            Drawing.Color.FromArgb(255, 105, 180)  // Hot Pink
        };
        
        _data.Clear();
        for (int i = 0; i < data.Count; i++)
        {
            _data.Add((data[i].Label, data[i].Value, colors[i % colors.Length]));
        }
        Invalidate();
    }

    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        if (_data.Count == 0) return;

        Graphics g = e.Graphics;
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

        double total = _data.Sum(d => d.Value);
        if (total == 0) return;

        int size = Math.Min(Width, Height) - 100;
        int x = (Width - size) / 2 - 50;
        int y = (Height - size) / 2;
        Rectangle rect = new Rectangle(x, y, size, size);

        float startAngle = 0;
        using (var font = new Font("Segoe UI", 9))
        {
            foreach (var item in _data)
            {
                float sweepAngle = (float)(item.Value / total * 360);
                using (var brush = new SolidBrush(item.Color))
                {
                    g.FillPie(brush, rect, startAngle, sweepAngle);
                }
                startAngle += sweepAngle;
            }

            // Draw legend
            int legendX = x + size + 20;
            int legendY = y;
            foreach (var item in _data)
            {
                using (var brush = new SolidBrush(item.Color))
                {
                    g.FillRectangle(brush, legendX, legendY, 15, 15);
                    g.DrawRectangle(Pens.Black, legendX, legendY, 15, 15);
                }
                string text = $"{item.Label}: {item.Value / total * 100:F1}%";
                g.DrawString(text, font, Brushes.Black, legendX + 20, legendY);
                legendY += 25;
            }
        }
    }
}


=============================================================================
YÊU CẦU BẮT BUỘC - CODE STRUCTURE
=============================================================================

### 1. NAMESPACE (Bắt buộc theo thư mục)
- Nếu [THƯ MỤC COMMANDS] = As → namespace SimpleBIM.Commands.As
- Nếu [THƯ MỤC COMMANDS] = MEPF → namespace SimpleBIM.Commands.MEPF
- Nếu [THƯ MỤC COMMANDS] = Qs → namespace SimpleBIM.Commands.Qs

### 2. USING DIRECTIVES TIÊU CHUẨN (Copy nguyên văn)
csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Diagnostics;

// WINDOWS FORMS (nếu cần UI dialog)
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;

// FILE I/O
using System.IO;
using System.Text;

// REVIT API - CORE
using Autodesk.Revit.ApplicationServices;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using Autodesk.Revit.Exceptions;

// JSON (có sẵn trong project)
using Newtonsoft.Json;

// ALIASES ĐỂ TRÁNH AMBIGUOUS REFERENCES
using WinForms = System.Windows.Forms;
using Drawing = System.Drawing;
using OperationCanceledException = Autodesk.Revit.Exceptions.OperationCanceledException;


### 3. USING BỔ SUNG THEO DOMAIN
- Kiến trúc (As): using Autodesk.Revit.DB.Architecture;
- Cơ điện (MEPF): using Autodesk.Revit.DB.Plumbing; using Autodesk.Revit.DB.Mechanical; 
  using Autodesk.Revit.DB.Electrical;
- Regex: using System.Text.RegularExpressions;

### 4. CLASS STRUCTURE (Template cố định)
csharp
[Transaction(TransactionMode.Manual)]
[Regeneration(RegenerationOption.Manual)]
public class [TÊN CLASS] : IExternalCommand
{
    // Instance variables
    private UIApplication _uiapp;
    private UIDocument _uidoc;
    private Document _doc;

    public Result Execute(
        ExternalCommandData commandData,
        ref string message,
        ElementSet elements)
    {
        _uiapp = commandData.Application;
        _uidoc = _uiapp.ActiveUIDocument;
        _doc = _uidoc.Document;

        try
        {
            return RunMain();
        }
        catch (OperationCanceledException)
        {
            return Result.Cancelled;
        }
        catch (Exception ex)
        {
            message = ex.Message;
            TaskDialog.Show("Loi", $"Loi thuc thi: {ex.Message}\n\n{ex.StackTrace}");
            return Result.Failed;
        }
    }

    private Result RunMain()
    {
        // === MAIN LOGIC HERE ===
        
        return Result.Succeeded;
    }
}


=============================================================================
YÊU CẦU BẮT BUỘC - REVIT API PATTERNS
=============================================================================

### 5. TRANSACTION HANDLING (Chỉ khi modify model)
csharp
// Pattern 1: Single Transaction
using (Transaction t = new Transaction(_doc, "Ten Transaction"))
{
    t.Start();
    try
    {
        // Code thay đổi model ở đây
        // ...
        t.Commit();
    }
    catch (Exception ex)
    {
        t.RollBack();
        TaskDialog.Show("Loi", $"Loi: {ex.Message}");
        return Result.Failed;
    }
}


### 6. FILTERED ELEMENT COLLECTOR (Lấy elements)
csharp
// Pattern cơ bản - By Category
FilteredElementCollector collector = new FilteredElementCollector(_doc)
    .OfCategory(BuiltInCategory.OST_Walls)
    .WhereElementIsNotElementType();

// Pattern cơ bản - By Class
FilteredElementCollector collector = new FilteredElementCollector(_doc)
    .OfClass(typeof(Wall));

// Lấy Materials
FilteredElementCollector materialCollector = new FilteredElementCollector(_doc)
    .OfClass(typeof(Material));


### 7. PARAMETER ACCESS
csharp
// Lấy Built-in Parameter
Parameter param = element.get_Parameter(BuiltInParameter.WALL_ATTR_WIDTH_PARAM);
if (param != null && param.HasValue)
{
    double value = param.AsDouble(); // Đơn vị internal (feet)
}

// Lấy Shared/Project Parameter
Parameter sharedParam = element.LookupParameter("Ten Parameter");


### 8. UNIT CONVERSION
csharp
// Convert internal units → cubic meters (volume)
double volumeM3 = UnitUtils.ConvertFromInternalUnits(volumeInternal, UnitTypeId.CubicMeters);

// Convert internal units → square meters (area)
double areaSqM = UnitUtils.ConvertFromInternalUnits(areaInternal, UnitTypeId.SquareMeters);

// Convert meters → internal units
double valueInternal = UnitUtils.ConvertToInternalUnits(1.5, UnitTypeId.Meters);


### 9. JSON SERIALIZATION (dùng Newtonsoft.Json)
csharp
// Serialize
string json = JsonConvert.SerializeObject(data, Formatting.Indented);
File.WriteAllText(filePath, json, Encoding.UTF8);

// Deserialize
string json = File.ReadAllText(filePath, Encoding.UTF8);
MyClass data = JsonConvert.DeserializeObject<MyClass>(json);


=============================================================================
QUY TẮC QUAN TRỌNG - PHẢI TUÂN THỦ
=============================================================================

### 10. REVIT API VERSION COMPATIBILITY (Revit 2020+)
- KHÔNG dùng: element.Id.IntegerValue → THAY BẰNG: element.Id.Value
- KHÔNG dùng: compound.GetTotalThickness() → THAY BẰNG: compound.GetWidth()
- KHÔNG dùng: UnitType.UT_Length → THAY BẰNG: UnitTypeId.Meters
- KHÔNG dùng: DisplayUnitType → THAY BẰNG: ForgeTypeId

### 11. ERROR HANDLING PATTERNS
csharp
try
{
    // Code chính
}
catch (OperationCanceledException)
{
    return Result.Cancelled;
}
catch (Exception ex)
{
    message = ex.Message;
    Debug.WriteLine($"Error: {ex.Message}\n{ex.StackTrace}");
    return Result.Failed;
}


### 12. CODING CONVENTIONS
- KHÔNG dùng dấu tiếng Việt trong tên biến, class, method
- Dùng tiếng Việt KHÔNG DẤU trong string messages: "Khong tim thay element nao!"
- Sử dụng LINQ cho queries
- Kiểm tra null TRƯỚC KHI sử dụng object
- Transaction CHỈ khi modify model

### 13. WINFORMS BEST PRACTICES
- Form nên có FormBorderStyle = Sizable hoặc FixedDialog
- Sử dụng TableLayoutPanel/FlowLayoutPanel cho responsive layout
- Anchor và Dock properties để resize controls
- Đặt StartPosition = CenterScreen hoặc CenterParent

### 14. QUY TẮC SỬ DỤNG ALIASES (CRITICAL - TRÁNH AMBIGUOUS REFERENCE)
csharp// ⚠️ SAI: Không dùng alias khi khai báo class kế thừa
public class MaterialDashboardForm : Form  // ❌ AMBIGUOUS!

// ✅ ĐÚNG: Luôn dùng FULLY QUALIFIED NAME khi kế thừa
public class MaterialDashboardForm : System.Windows.Forms.Form

// ⚠️ SAI: Không dùng alias cho controls trong khai báo biến
private TabControl _tabControl;  // ❌ AMBIGUOUS!
private Panel _panel;            // ❌ AMBIGUOUS!

// ✅ ĐÚNG: Luôn dùng FULLY QUALIFIED NAME cho WinForms controls
private System.Windows.Forms.TabControl _tabControl;
private System.Windows.Forms.Panel _panel;
private System.Windows.Forms.ComboBox _cmbCategory;
private System.Windows.Forms.Label _lblTotal;
private System.Windows.Forms.Button _btnExport;
private System.Windows.Forms.DataGridView _dataGrid;
private System.Windows.Forms.MenuStrip _menuStrip;

// ✅ ĐÚNG: Dùng FULLY QUALIFIED cho Revit DB types khi cần
private Autodesk.Revit.DB.Material _material;  // Tránh conflict với System.Windows.Media.Media3D.Material

// ✅ ĐÚNG: Alias CHỈ dùng cho instantiation, KHÔNG dùng cho declaration
var form = new WinForms.Form();                    // ✅ OK
var panel = new WinForms.Panel();                  // ✅ OK
var rect = new Drawing.Rectangle(0, 0, 100, 100); // ✅ OK
### 15. TEMPLATE KHAI BÁO WINFORMS CLASS (BẮT BUỘC)
csharp// ============================================================================
// WINFORMS CLASS TEMPLATE
// ============================================================================
public class MaterialDashboardForm : System.Windows.Forms.Form
{
    private Document _doc;
    private List<MaterialData> _allData = new List<MaterialData>();
    
    // Controls - LUÔN dùng System.Windows.Forms. prefix
    private System.Windows.Forms.MenuStrip _menuStrip;
    private System.Windows.Forms.TabControl _tabControl;
    private System.Windows.Forms.DataGridView _dataGrid;
    private System.Windows.Forms.ComboBox _cmbCategory;
    private System.Windows.Forms.Label _lblTotal;
    private System.Windows.Forms.Button _btnExport;
    private System.Windows.Forms.Button _btnRefresh;
    private SimpleBarChart _barChart;        // Custom controls không cần prefix
    private SimplePieChart _pieChart;
    
    public MaterialDashboardForm(Document doc)
    {
        _doc = doc;
        InitializeComponent();
        LoadData();
    }
    
    private void InitializeComponent()
    {
        // Instantiation - có thể dùng alias hoặc fully qualified
        _menuStrip = new System.Windows.Forms.MenuStrip();
        _tabControl = new System.Windows.Forms.TabControl();
        // hoặc
        _menuStrip = new WinForms.MenuStrip();  // ✅ Cũng OK
        _tabControl = new WinForms.TabControl(); // ✅ Cũng OK
    }
}
### 16. TEMPLATE CUSTOM PANEL/CHART CLASS (BẮT BUỘC)
csharp// ============================================================================
// CUSTOM CHART CLASS
// ============================================================================
public class SimpleBarChart : System.Windows.Forms.Panel  // ✅ FULLY QUALIFIED
{
    private List<(string Label, double Value)> _data = new List<(string, double)>();
    private System.Drawing.Color _barColor = System.Drawing.Color.SteelBlue;
    
    public SimpleBarChart()
    {
        DoubleBuffered = true;  // ✅ OK - thuộc tính của Panel
    }
    
    public void SetData(List<(string Label, double Value)> data)
    {
        _data = data ?? new List<(string, double)>();
        Invalidate();  // ✅ OK - method của Control
    }
    
    protected override void OnPaint(PaintEventArgs e)
    {
        base.OnPaint(e);
        
        Graphics g = e.Graphics;
        g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
        
        // Sử dụng Width, Height - thuộc tính của Control
        int padding = 60;
        int chartWidth = Width - padding * 2;
        int chartHeight = Height - padding * 2;
        
        // Vẽ với System.Drawing types
        using (var brush = new System.Drawing.SolidBrush(_barColor))
        using (var pen = new System.Drawing.Pen(System.Drawing.Color.Black, 2))
        {
            // Drawing code...
        }
    }
}
### 17. CHECKLIST TRÁNH AMBIGUOUS REFERENCE
Các types LUÔN cần FULLY QUALIFIED NAME trong declaration:

✅ System.Windows.Forms.Form (conflict với Autodesk.Revit.DB.Form)
✅ System.Windows.Forms.Panel (conflict với Autodesk.Revit.DB.Panel)
✅ System.Windows.Forms.Control (conflict với Autodesk.Revit.DB.Control)
✅ System.Windows.Forms.TabControl (conflict với System.Windows.Controls.TabControl)
✅ System.Windows.Forms.ComboBox (conflict với System.Windows.Controls.ComboBox)
✅ System.Windows.Forms.Label (conflict với System.Windows.Controls.Label)
✅ System.Windows.Forms.Button (conflict với System.Windows.Controls.Button)
✅ System.Windows.Forms.TextBox (conflict với System.Windows.Controls.TextBox)
✅ System.Drawing.Rectangle (conflict với Autodesk.Revit.DB.Rectangle)
✅ System.Drawing.Size (struct, không phải type)
✅ Autodesk.Revit.DB.Material (conflict với System.Windows.Media.Media3D.Material)

Các properties của Form/Control có sẵn (không cần prefix):

✅ Width, Height, Text, Size, Location
✅ BackColor, ForeColor, Font
✅ Dock, Anchor, Padding, Margin
✅ Controls, Controls.Add(), Controls.AddRange()
✅ StartPosition, FormBorderStyle, MinimumSize
✅ DoubleBuffered, Invalidate(), Refresh()
✅ Close(), Show(), ShowDialog(), Hide()

=============================================================================
VÍ DỤ HOÀN CHỈNH: MATERIAL DASHBOARD (THEO YÊU CẦU PHỨC TẠP)
=============================================================================

csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Diagnostics;

// WINDOWS FORMS
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Drawing2D;

// FILE I/O
using System.IO;
using System.Text;

// REVIT API - CORE
using Autodesk.Revit.ApplicationServices;
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;
using Autodesk.Revit.UI.Selection;
using Autodesk.Revit.Exceptions;

// JSON
using Newtonsoft.Json;

// ALIASES ĐỂ TRÁNH AMBIGUOUS REFERENCES
using WinForms = System.Windows.Forms;
using Drawing = System.Drawing;
using OperationCanceledException = Autodesk.Revit.Exceptions.OperationCanceledException;

namespace SimpleBIM.Commands.Qs
{
    // ============================================================================
    // EXTERNAL COMMAND
    // ============================================================================
    [Transaction(TransactionMode.Manual)]
    [Regeneration(RegenerationOption.Manual)]
    public class MaterialDashboard : IExternalCommand
    {
        private UIApplication _uiapp;
        private UIDocument _uidoc;
        private Document _doc;

        public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
        {
            _uiapp = commandData.Application;
            _uidoc = _uiapp.ActiveUIDocument;
            _doc = _uidoc.Document;

            try
            {
                using (var form = new MaterialDashboardForm(_doc))
                {
                    form.ShowDialog();
                }
                return Result.Succeeded;
            }
            catch (OperationCanceledException)
            {
                return Result.Cancelled;
            }
            catch (Exception ex)
            {
                message = ex.Message;
                TaskDialog.Show("Loi", $"Loi: {ex.Message}");
                return Result.Failed;
            }
        }
    }

    // ============================================================================
    // DATA MODELS
    // ============================================================================
    public class MaterialData
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public double Volume { get; set; }
        public double Area { get; set; }
        public double UnitCost { get; set; }
        public double TotalCost => Volume * UnitCost;
    }

    public class PresetData
    {
        public string CategoryFilter { get; set; }
        public Dictionary<string, double> UnitCosts { get; set; } = new Dictionary<string, double>();
    }

    // ============================================================================
    // MAIN FORM - FIXED: Dùng FULLY QUALIFIED NAME
    // ============================================================================
    public class MaterialDashboardForm : System.Windows.Forms.Form
    {
        private Document _doc;
        private List<MaterialData> _allData = new List<MaterialData>();
        private List<MaterialData> _filteredData = new List<MaterialData>();

        // Controls - FULLY QUALIFIED NAME
        private System.Windows.Forms.MenuStrip _menuStrip;
        private System.Windows.Forms.TabControl _tabControl;
        private System.Windows.Forms.DataGridView _dataGrid;
        private System.Windows.Forms.ComboBox _cmbCategory;
        private System.Windows.Forms.Label _lblTotal;
        private System.Windows.Forms.Button _btnExport;
        private SimpleBarChart _barChart;
        private SimplePieChart _pieChart;

        public MaterialDashboardForm(Document doc)
        {
            _doc = doc;
            InitializeComponent();
            LoadData();
        }

        private void InitializeComponent()
        {
            // Form settings
            Text = "Material Dashboard - SimpleBIM";
            Size = new System.Drawing.Size(1000, 700);
            MinimumSize = new System.Drawing.Size(800, 500);
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.Sizable;

            // Menu Strip
            _menuStrip = new System.Windows.Forms.MenuStrip();
            var fileMenu = new ToolStripMenuItem("File");
            fileMenu.DropDownItems.Add("Load Preset...", null, OnLoadPreset);
            fileMenu.DropDownItems.Add("Save Preset...", null, OnSavePreset);
            fileMenu.DropDownItems.Add(new ToolStripSeparator());
            fileMenu.DropDownItems.Add("Exit", null, (s, e) => Close());

            var helpMenu = new ToolStripMenuItem("Help");
            helpMenu.DropDownItems.Add("Huong dan su dung", null, OnShowHelp);

            _menuStrip.Items.Add(fileMenu);
            _menuStrip.Items.Add(helpMenu);

            // Tab Control
            _tabControl = new System.Windows.Forms.TabControl();
            _tabControl.Dock = DockStyle.Fill;

            // === TAB 1: Material List ===
            var tabList = new TabPage("Materials");
            var panelTop = new System.Windows.Forms.Panel { 
                Height = 50, 
                Dock = DockStyle.Top, 
                Padding = new Padding(10) 
            };

            var lblFilter = new System.Windows.Forms.Label { 
                Text = "Category:", 
                AutoSize = true, 
                Location = new System.Drawing.Point(10, 15) 
            };

            _cmbCategory = new System.Windows.Forms.ComboBox {
                Location = new System.Drawing.Point(80, 12),
                Width = 200,
                DropDownStyle = ComboBoxStyle.DropDownList
            };
            _cmbCategory.SelectedIndexChanged += OnCategoryChanged;

            _lblTotal = new System.Windows.Forms.Label {
                Text = "Total Cost: 0 VND",
                AutoSize = true,
                Location = new System.Drawing.Point(300, 15),
                Font = new Font("Segoe UI", 10, FontStyle.Bold)
            };

            panelTop.Controls.AddRange(new System.Windows.Forms.Control[] { 
                lblFilter, _cmbCategory, _lblTotal 
            });

            _dataGrid = new System.Windows.Forms.DataGridView {
                Dock = DockStyle.Fill,
                AutoSizeColumnsMode = DataGridViewAutoSizeColumnsMode.Fill,
                AllowUserToAddRows = false,
                AllowUserToDeleteRows = false,
                SelectionMode = DataGridViewSelectionMode.FullRowSelect,
                BackgroundColor = System.Drawing.Color.White
            };
            _dataGrid.CellValueChanged += OnCellValueChanged;

            tabList.Controls.Add(_dataGrid);
            tabList.Controls.Add(panelTop);

            // === TAB 2: Export ===
            var tabExport = new TabPage("Export");
            var panelExport = new TableLayoutPanel {
                Dock = DockStyle.Fill,
                ColumnCount = 1,
                RowCount = 3,
                Padding = new Padding(20)
            };
            panelExport.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            panelExport.RowStyles.Add(new RowStyle(SizeType.AutoSize));
            panelExport.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

            var lblExportInfo = new System.Windows.Forms.Label {
                Text = "Export data ra file CSV (co the mo bang Excel).\n" +
                       "File se bao gom: Ten Material, Volume, Area, Unit Cost, Total Cost.\n" +
                       "Dong cuoi cung la tong chi phi.",
                AutoSize = true,
                Padding = new Padding(0, 0, 0, 20)
            };

            _btnExport = new System.Windows.Forms.Button {
                Text = "Export to CSV",
                Size = new System.Drawing.Size(150, 40),
                BackColor = System.Drawing.Color.SteelBlue,
                ForeColor = System.Drawing.Color.White,
                FlatStyle = FlatStyle.Flat
            };
            _btnExport.Click += OnExportClick;

            _pieChart = new SimplePieChart {
                Dock = DockStyle.Fill,
                BackColor = System.Drawing.Color.White
            };

            panelExport.Controls.Add(lblExportInfo, 0, 0);
            panelExport.Controls.Add(_btnExport, 0, 1);
            panelExport.Controls.Add(_pieChart, 0, 2);
            tabExport.Controls.Add(panelExport);

            // === TAB 3: Visualization ===
            var tabVis = new TabPage("Visualization");
            _barChart = new SimpleBarChart {
                Dock = DockStyle.Fill,
                BackColor = System.Drawing.Color.White
            };
            tabVis.Controls.Add(_barChart);

            // Add tabs
            _tabControl.TabPages.Add(tabList);
            _tabControl.TabPages.Add(tabExport);
            _tabControl.TabPages.Add(tabVis);

            // Add to form
            Controls.Add(_tabControl);
            Controls.Add(_menuStrip);
            MainMenuStrip = _menuStrip;
        }

        private void LoadData()
        {
            _allData.Clear();

            var categories = new Dictionary<BuiltInCategory, string> {
                { BuiltInCategory.OST_Walls, "Walls" },
                { BuiltInCategory.OST_Floors, "Floors" },
                { BuiltInCategory.OST_Roofs, "Roofs" },
                { BuiltInCategory.OST_Ceilings, "Ceilings" }
            };

            foreach (var kvp in categories)
            {
                var collector = new FilteredElementCollector(_doc)
                    .OfCategory(kvp.Key)
                    .WhereElementIsNotElementType();

                foreach (Element elem in collector)
                {
                    try
                    {
                        // Get volume
                        Parameter volParam = elem.get_Parameter(BuiltInParameter.HOST_VOLUME_COMPUTED);
                        double volume = 0;
                        if (volParam != null && volParam.HasValue)
                        {
                            volume = UnitUtils.ConvertFromInternalUnits(
                                volParam.AsDouble(), UnitTypeId.CubicMeters);
                        }

                        // Get area
                        Parameter areaParam = elem.get_Parameter(BuiltInParameter.HOST_AREA_COMPUTED);
                        double area = 0;
                        if (areaParam != null && areaParam.HasValue)
                        {
                            area = UnitUtils.ConvertFromInternalUnits(
                                areaParam.AsDouble(), UnitTypeId.SquareMeters);
                        }

                        // Get material name - FIXED: Dùng Autodesk.Revit.DB.Material
                        string materialName = "Unknown";
                        var matIds = elem.GetMaterialIds(false);
                        if (matIds.Count > 0)
                        {
                            Autodesk.Revit.DB.Material mat = _doc.GetElement(matIds.First()) as Autodesk.Revit.DB.Material;
                            if (mat != null) materialName = mat.Name;
                        }

                        if (volume > 0 || area > 0)
                        {
                            _allData.Add(new MaterialData {
                                Name = materialName,
                                Category = kvp.Value,
                                Volume = volume,
                                Area = area,
                                UnitCost = 500000
                            });
                        }
                    }
                    catch { continue; }
                }
            }

            // Group by material name
            _allData = _allData
                .GroupBy(m => new { m.Name, m.Category })
                .Select(g => new MaterialData {
                    Name = g.Key.Name,
                    Category = g.Key.Category,
                    Volume = g.Sum(x => x.Volume),
                    Area = g.Sum(x => x.Area),
                    UnitCost = g.First().UnitCost
                })
                .OrderBy(m => m.Category)
                .ThenBy(m => m.Name)
                .ToList();

            // Populate category filter
            var cats = new List<string> { "All" };
            cats.AddRange(_allData.Select(m => m.Category).Distinct());
            _cmbCategory.Items.Clear();
            _cmbCategory.Items.AddRange(cats.ToArray());
            _cmbCategory.SelectedIndex = 0;

            ApplyFilter();
        }

        private void ApplyFilter()
        {
            string cat = _cmbCategory.SelectedItem?.ToString() ?? "All";
            _filteredData = cat == "All"
                ? _allData.ToList()
                : _allData.Where(m => m.Category == cat).ToList();

            _dataGrid.DataSource = null;
            _dataGrid.DataSource = _filteredData;

            if (_dataGrid.Columns.Count > 0)
            {
                _dataGrid.Columns["Name"].HeaderText = "Material";
                _dataGrid.Columns["Name"].ReadOnly = true;
                _dataGrid.Columns["Category"].ReadOnly = true;
                _dataGrid.Columns["Volume"].HeaderText = "Volume (m³)";
                _dataGrid.Columns["Volume"].DefaultCellStyle.Format = "F3";
                _dataGrid.Columns["Volume"].ReadOnly = true;
                _dataGrid.Columns["Area"].HeaderText = "Area (m²)";
                _dataGrid.Columns["Area"].DefaultCellStyle.Format = "F3";
                _dataGrid.Columns["Area"].ReadOnly = true;
                _dataGrid.Columns["UnitCost"].HeaderText = "Unit Cost (VND/m³)";
                _dataGrid.Columns["UnitCost"].DefaultCellStyle.Format = "N0";
                _dataGrid.Columns["TotalCost"].HeaderText = "Total Cost (VND)";
                _dataGrid.Columns["TotalCost"].DefaultCellStyle.Format = "N0";
                _dataGrid.Columns["TotalCost"].ReadOnly = true;
            }

            UpdateTotal();
            UpdateCharts();
        }

        private void UpdateTotal()
        {
            double total = _filteredData.Sum(m => m.TotalCost);
            _lblTotal.Text = $"Total Cost: {total:N0} VND";
        }

        private void UpdateCharts()
        {
            var barData = _filteredData
                .Take(10)
                .Select(m => (m.Name.Length > 15 ? m.Name.Substring(0, 15) + "..." : m.Name, m.Volume))
                .ToList();
            _barChart.SetData(barData);

            var pieData = _filteredData
                .OrderByDescending(m => m.TotalCost)
                .Take(8)
                .Select(m => (m.Name.Length > 20 ? m.Name.Substring(0, 20) + "..." : m.Name, m.TotalCost))
                .ToList();
            _pieChart.SetData(pieData);
        }

        private void OnCategoryChanged(object sender, EventArgs e)
        {
            ApplyFilter();
        }

        private void OnCellValueChanged(object sender, DataGridViewCellEventArgs e)
        {
            if (e.RowIndex >= 0 && _dataGrid.Columns[e.ColumnIndex].Name == "UnitCost")
            {
                _dataGrid.Refresh();
                UpdateTotal();
                UpdateCharts();
            }
        }

        private void OnExportClick(object sender, EventArgs e)
        {
            using (var dialog = new SaveFileDialog())
            {
                dialog.Filter = "CSV files (*.csv)|*.csv";
                dialog.FileName = $"MaterialExport_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

                if (dialog.ShowDialog() == DialogResult.OK)
                {
                    try
                    {
                        ExportToCsv(_filteredData, dialog.FileName);
                        MessageBox.Show("Export thanh cong!", "Thong bao",
                            MessageBoxButtons.OK, MessageBoxIcon.Information);
                        Process.Start(new ProcessStartInfo(dialog.FileName) { UseShellExecute = true });
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Loi khi export: {ex.Message}", "Loi",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }

        private void ExportToCsv(List<MaterialData> data, string filePath)
        {
            using (StreamWriter sw = new StreamWriter(filePath, false, new UTF8Encoding(true)))
            {
                sw.WriteLine("Material Name,Category,Volume (m³),Area (m²),Unit Cost (VND),Total Cost (VND)");

                foreach (var item in data)
                {
                    string name = EscapeCsv(item.Name);
                    sw.WriteLine($"{name},{item.Category},{item.Volume:F3},{item.Area:F3},{item.UnitCost:F0},{item.TotalCost:F0}");
                }

                sw.WriteLine($"TOTAL,,,,, {data.Sum(m => m.TotalCost):F0}");
            }
        }

        private string EscapeCsv(string value)
        {
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
                return "\"" + value.Replace("\"", "\"\"") + "\"";
            return value;
        }

        private void OnLoadPreset(object sender, EventArgs e)
        {
            using (var dialog = new OpenFileDialog())
            {
                dialog.Filter = "JSON files (*.json)|*.json";
                if (dialog.ShowDialog() == DialogResult.OK)
                {
                    try
                    {
                        string json = File.ReadAllText(dialog.FileName, Encoding.UTF8);
                        var preset = JsonConvert.DeserializeObject<PresetData>(json);

                        if (!string.IsNullOrEmpty(preset.CategoryFilter))
                        {
                            int idx = _cmbCategory.Items.IndexOf(preset.CategoryFilter);
                            if (idx >= 0) _cmbCategory.SelectedIndex = idx;
                        }

                        foreach (var cost in preset.UnitCosts)
                        {
                            var item = _allData.FirstOrDefault(m => m.Name == cost.Key);
                            if (item != null) item.UnitCost = cost.Value;
                        }

                        ApplyFilter();
                        MessageBox.Show("Load preset thanh cong!", "Thong bao");
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Loi: {ex.Message}", "Loi", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }

        private void OnSavePreset(object sender, EventArgs e)
        {
            using (var dialog = new SaveFileDialog())
            {
                dialog.Filter = "JSON files (*.json)|*.json";
                dialog.FileName = "MaterialPreset.json";

                if (dialog.ShowDialog() == DialogResult.OK)
                {
                    try
                    {
                        var preset = new PresetData {
                            CategoryFilter = _cmbCategory.SelectedItem?.ToString(),
                            UnitCosts = _allData.ToDictionary(m => m.Name, m => m.UnitCost)
                        };

                        string json = JsonConvert.SerializeObject(preset, Formatting.Indented);
                        File.WriteAllText(dialog.FileName, json, Encoding.UTF8);
                        MessageBox.Show("Save preset thanh cong!", "Thong bao");
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Loi: {ex.Message}", "Loi", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
        }

        private void OnShowHelp(object sender, EventArgs e)
        {
            string helpText = @"HUONG DAN SU DUNG MATERIAL DASHBOARD

Tab Materials:
- Hien thi danh sach vat lieu trong model
- Loc theo Category bang dropdown
- Chinh sua Unit Cost truc tiep tren grid
- Total Cost tu dong tinh lai

Tab Export:
- Export du lieu ra file CSV
- File co the mo bang Excel
- Bao gom bieu do ty le chi phi

Tab Visualization:
- Bieu do cot so sanh Volume
- Bieu do tron ty le chi phi

Menu File:
- Load Preset: Load cau hinh da luu
- Save Preset: Luu cau hinh hien tai

Lien he: support@simplebim.vn";

            MessageBox.Show(helpText, "Huong dan", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }

    // ============================================================================
    // CUSTOM CHART CONTROLS - FIXED: Dùng FULLY QUALIFIED NAME
    // ============================================================================
    public class SimpleBarChart : System.Windows.Forms.Panel
    {
        private List<(string Label, double Value)> _data = new List<(string, double)>();
        private System.Drawing.Color _barColor = System.Drawing.Color.SteelBlue;

        public void SetData(List<(string Label, double Value)> data)
        {
            _data = data ?? new List<(string, double)>();
            Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (_data.Count == 0)
            {
                e.Graphics.DrawString("No data", Font, Brushes.Gray, 10, 10);
                return;
            }

            Graphics g = e.Graphics;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

            int padding = 50;
            int chartWidth = Width - padding * 2;
            int chartHeight = Height - padding * 2;
            double maxValue = _data.Max(d => d.Value);
            if (maxValue == 0) maxValue = 1;

            int barWidth = Math.Max(20, (chartWidth / _data.Count) - 10);

            using (var brush = new System.Drawing.SolidBrush(_barColor))
            using (var pen = new System.Drawing.Pen(System.Drawing.Color.Black))
            using (var font = new Font("Segoe UI", 8))
            {
                g.DrawLine(pen, padding, padding, padding, Height - padding);
                g.DrawLine(pen, padding, Height - padding, Width - padding, Height - padding);

                for (int i = 0; i < _data.Count; i++)
                {
                    int x = padding + i * (barWidth + 10) + 5;
                    int barHeight = (int)((_data[i].Value / maxValue) * chartHeight);
                    int y = Height - padding - barHeight;

                    g.FillRectangle(brush, x, y, barWidth, barHeight);
                    g.DrawRectangle(pen, x, y, barWidth, barHeight);

                    string valueText = _data[i].Value.ToString("F1");
                    var valueSize = g.MeasureString(valueText, font);
                    g.DrawString(valueText, font, Brushes.Black,
                        x + (barWidth - valueSize.Width) / 2, y - valueSize.Height - 2);

                    var matrix = new System.Drawing.Drawing2D.Matrix();
                    matrix.RotateAt(-45, new System.Drawing.PointF(x + barWidth / 2, Height - padding + 5));
                    g.Transform = matrix;
                    g.DrawString(_data[i].Label, font, Brushes.Black,
                        x + barWidth / 2, Height - padding + 5);
                    g.ResetTransform();
                }
            }
        }
    }

    public class SimplePieChart : System.Windows.Forms.Panel
    {
        private List<(string Label, double Value, System.Drawing.Color Color)> _data =
            new List<(string, double, System.Drawing.Color)>();

        private static readonly System.Drawing.Color[] _colors = {
            System.Drawing.Color.FromArgb(70, 130, 180),
            System.Drawing.Color.FromArgb(60, 179, 113),
            System.Drawing.Color.FromArgb(255, 165, 0),
            System.Drawing.Color.FromArgb(220, 20, 60),
            System.Drawing.Color.FromArgb(138, 43, 226),
            System.Drawing.Color.FromArgb(64, 224, 208),
            System.Drawing.Color.FromArgb(255, 215, 0),
            System.Drawing.Color.FromArgb(255, 105, 180)
        };

        public void SetData(List<(string Label, double Value)> data)
        {
            _data.Clear();
            if (data != null)
            {
                for (int i = 0; i < data.Count; i++)
                {
                    _data.Add((data[i].Label, data[i].Value, _colors[i % _colors.Length]));
                }
            }
            Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (_data.Count == 0)
            {
                e.Graphics.DrawString("No data", Font, Brushes.Gray, 10, 10);
                return;
            }

            Graphics g = e.Graphics;
            g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;

            double total = _data.Sum(d => d.Value);
            if (total == 0) return;

            int chartSize = Math.Min(Width - 150, Height - 50);
            int x = 20;
            int y = (Height - chartSize) / 2;
            System.Drawing.Rectangle rect = new System.Drawing.Rectangle(x, y, chartSize, chartSize);

            float startAngle = 0;
            using (var font = new Font("Segoe UI", 9))
            {
                foreach (var item in _data)
                {
                    float sweepAngle = (float)(item.Value / total * 360);
                    using (var brush = new System.Drawing.SolidBrush(item.Color))
                    {
                        g.FillPie(brush, rect, startAngle, sweepAngle);
                    }
                    startAngle += sweepAngle;
                }

                int legendX = x + chartSize + 20;
                int legendY = y;
                foreach (var item in _data)
                {
                    using (var brush = new System.Drawing.SolidBrush(item.Color))
                    {
                        g.FillRectangle(brush, legendX, legendY, 15, 15);
                        g.DrawRectangle(Pens.Black, legendX, legendY, 15, 15);
                    }
                    string text = $"{item.Label}: {item.Value / total * 100:F1}%";
                    g.DrawString(text, font, Brushes.Black, legendX + 20, legendY);
                    legendY += 22;
                }
            }
        }
    }
}


=============================================================================
ĐẦU RA YÊU CẦU
=============================================================================

Hãy sinh code C# HOÀN CHỈNH cho tính năng "[MÔ TẢ TÍNH NĂNG MỚI]" với:
1. File .cs đầy đủ, compile thành công ngay lập tức
2. CHỈ sử dụng các assemblies đã liệt kê trong DANH SÁCH CÓ SẴN
3. Nếu yêu cầu Chart → Dùng GDI+ custom drawing (như ví dụ)
4. Nếu yêu cầu Excel → Dùng CSV export thay thế
5. Namespace đúng theo thư mục
6. Transaction handling nếu modify model
7. Error handling đầy đủ

⛔ TUYỆT ĐỐI KHÔNG:
- Sử dụng System.Windows.Forms.DataVisualization
- Sử dụng Microsoft.Office.Interop.Excel
- Sử dụng bất kỳ thư viện nào không có trong danh sách
- Thêm TODO comments hoặc placeholder code
- Assume project có thêm references khác

=============================================================================
⚠️ QUY TẮC TƯƠNG THÍCH PHIÊN BẢN REVIT API (BẮT BUỘC - ÁP DỤNG CHO MỌI TÍNH NĂNG)
=============================================================================

Project SimpleBIM hỗ trợ Revit từ 2020 đến 2024 (và tương lai), do đó code PHẢI compile và chạy được trên Revit 2020+ mà KHÔNG cần rebuild riêng.

⛔ TUYỆT ĐỐI KHÔNG SỬ DỤNG các API chỉ có từ Revit 2025 trở lên, bao gồm nhưng không giới hạn:
- Autodesk.Revit.UI.ThemeManager
- Autodesk.Revit.UI.ThemeType
- Autodesk.Revit.UI.UIThemeManager
- Bất kỳ class/enum/method nào liên quan đến ThemeChanged event hoặc detect dark/light theme tự động

Lý do: Những API này KHÔNG tồn tại trước Revit 2025 → gây lỗi compile.

✅ THAY THẾ CHO DARK MODE / THEME:
- Nếu mô tả tính năng yêu cầu "dark mode nếu Revit đang dark" hoặc tương tự → BỎ QUA việc detect tự động.
- Thay vào đó: 
  + Hard-code một theme tối nhẹ nhàng (BackColor = Color.FromArgb(45,45,48), ForeColor = Color.WhiteSmoke, DataGridView grid color phù hợp) để form đẹp và dễ nhìn trên cả light/dark Revit.
  + Hoặc để mặc định light theme (an toàn nhất).
  + KHÔNG cố gắng detect theme bằng bất kỳ cách nào (kể cả reflection hoặc Windows API).
- WinForms dialog không tự inherit dark theme hoàn hảo từ Revit → hard-code là cách ổn định và đẹp nhất.

Nếu mô tả có yêu cầu dark mode → ưu tiên hard-code theme tối thay vì detect.`;

  const generatePrompt = () => {
    if (!formData.className.trim() || !formData.directory.trim() || !formData.description.trim()) {
      alert('Vui lòng điền đầy đủ tất cả các trường!');
      return;
    }

    const prompt = promptTemplate
      .replace('[CLASS_NAME]', formData.className)
      .replace('[DIRECTORY]', formData.directory)
      .replace(/\[DESCRIPTION\]/g, formData.description);

    setGeneratedPrompt(prompt);
    setCopySuccess(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const clearForm = () => {
    setFormData({
      className: '',
      directory: '',
      description: ''
    });
    setGeneratedPrompt('');
    setCopySuccess(false);
  };

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '700',
      color: '#1f2937',
      marginBottom: '8px',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#6b7280',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      '@media (min-width: 1024px)': {
        gridTemplateColumns: '1fr 1fr',
      }
    },
    card: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #e5e7eb',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#1f2937',
      marginBottom: '20px',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '6px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '0.9375rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
      transition: 'border-color 0.2s',
    },
    textarea: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '0.9375rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical',
      fontFamily: 'inherit',
      transition: 'border-color 0.2s',
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      fontSize: '0.9375rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      outline: 'none',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '0.9375rem',
      fontWeight: '500',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
    successButton: {
      backgroundColor: '#10b981',
      color: '#ffffff',
    },
    outputCard: {
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      gridColumn: '1 / -1',
    },
    promptBox: {
      backgroundColor: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '16px',
      fontSize: '0.875rem',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      maxHeight: '500px',
      overflowY: 'auto',
      lineHeight: '1.6',
    },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#9ca3af',
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '16px',
    },
    infoBox: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '6px',
      padding: '12px 16px',
      marginBottom: '20px',
      fontSize: '0.875rem',
      color: '#1e40af',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Tạo Prompt SimpleBIM</h1>
        <p style={styles.subtitle}>
          Tạo prompt để AI sinh code cho Revit add-in commands
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr', gap: '24px' }}>
        {/* Form Input */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <i className="las la-edit"></i> Thông tin Command
          </h2>

          <div style={styles.infoBox}>
            <i className="las la-info-circle"></i> Điền đầy đủ thông tin để tạo prompt cho AI
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Tên Class <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              placeholder="Ví dụ: DoorSchedule, WallAnalysis..."
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Thư mục Commands <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              name="directory"
              value={formData.directory}
              onChange={handleInputChange}
              placeholder="Ví dụ: As, MEPF, Qs..."
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Mô tả tính năng <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Mô tả chi tiết tính năng cần tạo..."
              style={styles.textarea}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={generatePrompt}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              <i className="las la-magic"></i>
              Tạo Prompt
            </button>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={clearForm}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            >
              <i className="las la-redo"></i>
              Làm mới
            </button>
          </div>
        </div>

        {/* Output */}
        <div style={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={styles.cardTitle}>
              <i className="las la-file-code"></i> Prompt đã tạo
            </h2>
            {generatedPrompt && (
              <button
                style={{
                  ...styles.button,
                  ...(copySuccess ? styles.successButton : styles.primaryButton),
                  padding: '8px 16px',
                }}
                onClick={copyToClipboard}
                onMouseEnter={(e) => {
                  if (!copySuccess) e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  if (!copySuccess) e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                <i className={copySuccess ? 'las la-check' : 'las la-copy'}></i>
                {copySuccess ? 'Đã sao chép!' : 'Sao chép'}
              </button>
            )}
          </div>

          {generatedPrompt ? (
            <div style={styles.promptBox}>{generatedPrompt}</div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <i className="las la-file-alt"></i>
              </div>
              <p>Prompt sẽ hiển thị ở đây sau khi bạn tạo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptGenerator;
