// RAG Data - Dữ liệu hướng dẫn phát triển SimpleBIM Revit Add-in
// Phục vụ chatbot hướng dẫn người dùng tạo, chỉnh sửa C# trong Visual Studio 2022
// Build, obfuscate, upload GitHub Release, cập nhật website

const ragData = {
  metadata: {
    version: "2.0.0",
    created_at: "2025-12-26",
    description: "Hướng dẫn phát triển SimpleBIM - Revit Add-in với Visual Studio 2022",
    purpose: "Hỗ trợ người dùng tạo/chỉnh sửa C#, build, obfuscate, release GitHub, cập nhật website"
  },

  chunks: [
    // ==================== TỔNG QUAN DỰ ÁN ====================
    {
      id: "overview-01",
      category: "overview",
      title: "Tổng quan dự án SimpleBIM",
      content: `SimpleBIM là Revit Add-in viết bằng C# (.NET Framework 4.8) chạy trên Autodesk Revit 2018-2026.

**Mục đích:**
- Cung cấp công cụ BIM automation cho các ngành: Kiến trúc (AS), Cơ điện (MEPF), Định lượng (QS)
- Hệ thống license online/offline với mã hóa AES-256
- Tự động kiểm tra và cập nhật phiên bản mới

**Thành phần chính:**
- SimpleBIM/ - Mã nguồn chính của Add-in (C#)
- SimpleBIM.Installer/ - Công cụ cài đặt (Console App)
- ConfuserEx-GUI/ - Công cụ làm rối mã nguồn
- output/ - Thư mục chứa file build
- backend/ - API server (FastAPI Python)
- frontend/ - Admin dashboard (React)`,
      keywords: ["simplebim", "revit", "add-in", "overview", "tổng quan", "dự án"]
    },

    {
      id: "overview-02",
      category: "overview",
      title: "Cấu trúc thư mục dự án SimpleBIM",
      content: `**Cấu trúc thư mục trong Visual Studio 2022:**

\`\`\`
SimpleBIM/
├── App.cs                    # Entry point của Add-in
├── ShowLicenseCommand.cs     # Command hiển thị license
├── packages.config           # NuGet packages
├── SimpleBIM.csproj          # Project file
│
├── Commands/                 # Các lệnh Revit
│   ├── As/                   # 10 commands Kiến trúc
│   ├── MEPF/                 # 13 commands Cơ điện
│   ├── Qs/                   # 7 commands Định lượng
│   └── CheckForUpdatesCommand.cs
│
├── Ribbon/                   # Giao diện Ribbon
│   ├── RibbonManager.cs      # Quản lý tạo ribbon
│   └── Panels/               # AsPanel, MEPFPanel, QsPanel
│
├── Icons/                    # Icons cho buttons
│   ├── 16/                   # 16x16 pixels
│   └── 32/                   # 32x32 pixels
│
├── License/                  # Hệ thống license
│   ├── LicenseManager.cs
│   ├── LicenseWindow.xaml
│   └── LicenseWindow.xaml.cs
│
└── Update/                   # Hệ thống auto update
    ├── UpdateService.cs
    ├── VersionManager.cs
    ├── ForceVersion.cs
    └── ...
\`\`\``,
      keywords: ["cấu trúc", "thư mục", "folder", "structure", "visual studio"]
    },

    // ==================== VISUAL STUDIO 2022 ====================
    {
      id: "vs2022-01",
      category: "visual-studio",
      title: "Cài đặt Visual Studio 2022 cho SimpleBIM",
      content: `**Yêu cầu cài đặt Visual Studio 2022:**

1. **Tải Visual Studio 2022 Community** (miễn phí): https://visualstudio.microsoft.com/vs/community/

2. **Chọn Workloads khi cài đặt:**
   - ✅ .NET desktop development (BẮT BUỘC)
   - ✅ Desktop development with C++
   
3. **Individual Components cần thêm:**
   - .NET Framework 4.8 SDK
   - .NET Framework 4.8 targeting pack

4. **Sau khi cài xong:**
   - Mở Visual Studio 2022
   - File → Open → Project/Solution
   - Chọn file SimpleBIM.sln

**Lưu ý:** KHÔNG dùng Visual Studio Code. Dự án C# .NET Framework chỉ chạy được trong Visual Studio đầy đủ.`,
      keywords: ["visual studio", "cài đặt", "install", "2022", "workload", "NET Framework"]
    },

    {
      id: "vs2022-02",
      category: "visual-studio",
      title: "Giao diện Visual Studio 2022 cơ bản",
      content: `**Các panel quan trọng trong Visual Studio 2022:**

1. **Solution Explorer** (Ctrl+Alt+L):
   - Hiển thị cây thư mục dự án
   - Chuột phải để Add/Delete files
   - Nơi quản lý tất cả file .cs, .xaml, icons

2. **Editor chính (giữa màn hình):**
   - Viết và chỉnh sửa code C#
   - Có IntelliSense tự động gợi ý code
   - F12: Go to Definition

3. **Output Window** (Ctrl+Alt+O):
   - Xem kết quả build
   - Hiển thị errors và warnings

4. **Error List** (Ctrl+\\, E):
   - Danh sách tất cả lỗi trong project
   - Double-click để nhảy đến dòng lỗi

5. **Properties Window** (F4):
   - Xem/sửa thuộc tính file
   - Quan trọng: Build Action của icons

**Toolbar quan trọng:**
- Configuration dropdown: Debug/Release
- Start button (F5): Chạy debug
- Build menu: Build/Rebuild Solution`,
      keywords: ["giao diện", "interface", "panel", "solution explorer", "output", "visual studio"]
    },

    // ==================== TẠO COMMAND MỚI ====================
    {
      id: "command-01",
      category: "command",
      title: "Cách tạo Command mới trong Visual Studio 2022",
      content: `**Bước 1: Tạo file Command mới**

1. Mở Solution Explorer (Ctrl+Alt+L)
2. Chuột phải vào thư mục Commands/As/ (hoặc MEPF/, Qs/)
3. Chọn Add → Class...
4. Đặt tên: MyNewCommand.cs
5. Click Add

**Bước 2: Viết code Command**

\`\`\`csharp
using Autodesk.Revit.Attributes;
using Autodesk.Revit.DB;
using Autodesk.Revit.UI;

namespace SimpleBIM.Commands.As
{
    [Transaction(TransactionMode.Manual)]
    public class MyNewCommand : IExternalCommand
    {
        public Result Execute(
            ExternalCommandData commandData,
            ref string message,
            ElementSet elements)
        {
            // Lấy Revit application và document
            UIApplication uiapp = commandData.Application;
            UIDocument uidoc = uiapp.ActiveUIDocument;
            Document doc = uidoc.Document;

            // Logic của bạn ở đây
            TaskDialog.Show("SimpleBIM", "Hello từ MyNewCommand!");

            return Result.Succeeded;
        }
    }
}
\`\`\`

**Giải thích:**
- \`[Transaction(TransactionMode.Manual)]\`: Khai báo command cần transaction thủ công
- \`IExternalCommand\`: Interface bắt buộc cho Revit commands
- \`Execute()\`: Method được gọi khi user click button`,
      keywords: ["command", "tạo mới", "IExternalCommand", "Execute", "C#", "code"]
    },

    {
      id: "command-02",
      category: "command",
      title: "Sử dụng Transaction trong Command",
      content: `**Transaction là gì?**
Transaction là cơ chế của Revit để thay đổi model. Mọi thay đổi (tạo/xóa/sửa elements) PHẢI nằm trong transaction.

**Cách sử dụng Transaction:**

\`\`\`csharp
public Result Execute(ExternalCommandData commandData, ref string message, ElementSet elements)
{
    UIDocument uidoc = commandData.Application.ActiveUIDocument;
    Document doc = uidoc.Document;

    // Bắt đầu transaction
    using (Transaction trans = new Transaction(doc, "Tên công việc"))
    {
        trans.Start();

        try
        {
            // === VIẾT CODE THAY ĐỔI MODEL Ở ĐÂY ===
            
            // Ví dụ: Tạo tường mới
            Line line = Line.CreateBound(XYZ.Zero, new XYZ(10, 0, 0));
            Wall wall = Wall.Create(doc, line, level.Id, false);

            // Commit transaction nếu thành công
            trans.Commit();
            return Result.Succeeded;
        }
        catch (Exception ex)
        {
            // Rollback nếu có lỗi
            trans.RollBack();
            message = ex.Message;
            return Result.Failed;
        }
    }
}
\`\`\`

**Lưu ý quan trọng:**
- Luôn dùng \`using\` để đảm bảo transaction được dispose
- Đặt tên transaction rõ ràng (hiển thị trong Undo history)
- Commit() để lưu thay đổi, RollBack() nếu lỗi`,
      keywords: ["transaction", "commit", "rollback", "thay đổi", "model", "revit"]
    },

    {
      id: "command-03",
      category: "command",
      title: "Lấy thông tin từ Revit Document",
      content: `**Các cách lấy elements từ Document:**

**1. Lấy elements đang được chọn:**
\`\`\`csharp
ICollection<ElementId> selectedIds = uidoc.Selection.GetElementIds();
foreach (ElementId id in selectedIds)
{
    Element elem = doc.GetElement(id);
    // Xử lý element
}
\`\`\`

**2. Lấy tất cả elements theo loại (FilteredElementCollector):**
\`\`\`csharp
// Lấy tất cả Walls
FilteredElementCollector collector = new FilteredElementCollector(doc);
IList<Element> walls = collector
    .OfClass(typeof(Wall))
    .ToElements();

// Lấy tất cả Rooms
FilteredElementCollector roomCollector = new FilteredElementCollector(doc);
IList<Element> rooms = roomCollector
    .OfCategory(BuiltInCategory.OST_Rooms)
    .WhereElementIsNotElementType()
    .ToElements();
\`\`\`

**3. Cho user chọn element:**
\`\`\`csharp
Reference pickedRef = uidoc.Selection.PickObject(
    ObjectType.Element,
    "Chọn một element"
);
Element pickedElem = doc.GetElement(pickedRef);
\`\`\`

**4. Lấy parameter của element:**
\`\`\`csharp
// Lấy theo tên parameter
Parameter param = element.LookupParameter("Tên Parameter");
string value = param?.AsString();

// Lấy theo BuiltInParameter
Parameter heightParam = wall.get_Parameter(BuiltInParameter.WALL_USER_HEIGHT_PARAM);
double height = heightParam.AsDouble();
\`\`\``,
      keywords: ["element", "document", "FilteredElementCollector", "selection", "parameter"]
    },

    // ==================== RIBBON UI ====================
    {
      id: "ribbon-01",
      category: "ribbon",
      title: "Cách thêm Button vào Ribbon",
      content: `**Để thêm button cho command mới:**

**Bước 1: Mở file Panel tương ứng**
- As commands → SimpleBIM/Ribbon/Panels/AsPanel.cs
- MEPF commands → SimpleBIM/Ribbon/Panels/MEPFPanel.cs
- QS commands → SimpleBIM/Ribbon/Panels/QsPanel.cs

**Bước 2: Thêm code tạo button**

\`\`\`csharp
// Tìm panel phù hợp hoặc tạo panel mới
RibbonPanel panel = app.CreateRibbonPanel(tabName, "Tên Panel");

// Tạo button data
PushButtonData btnMyCommand = new PushButtonData(
    "btnMyNewCommand",                              // ID duy nhất
    "Tên Button\\nHiển thị",                        // Tên (\\n để xuống dòng)
    typeof(App).Assembly.Location,                  // Đường dẫn DLL
    "SimpleBIM.Commands.As.MyNewCommand"           // Full class name
);

// Thiết lập tooltip
btnMyCommand.ToolTip = "Mô tả ngắn khi hover";
btnMyCommand.LongDescription = "Mô tả chi tiết hơn về chức năng của command này.";

// Load icon
App.LoadIconToButton(btnMyCommand, "MyCommandIcon");

// Thêm button vào panel
panel.AddItem(btnMyCommand);
\`\`\`

**Lưu ý:**
- Full class name phải chính xác (namespace + class name)
- Icon name phải khớp với file trong Icons/16/ và Icons/32/`,
      keywords: ["ribbon", "button", "panel", "PushButtonData", "giao diện"]
    },

    {
      id: "ribbon-02",
      category: "ribbon",
      title: "Tạo Ribbon Tab mới",
      content: `**Nếu muốn tạo tab mới (ví dụ: BS - Building Services):**

**Bước 1: Tạo thư mục commands**
- Chuột phải Commands → Add → New Folder → đặt tên "Bs"

**Bước 2: Tạo file Panel**
1. Chuột phải Ribbon/Panels → Add → Class → BsPanel.cs
2. Copy nội dung từ MEPFPanel.cs và sửa lại

**Bước 3: Đăng ký tab trong RibbonManager.cs**

Mở SimpleBIM/Ribbon/RibbonManager.cs, thêm code:

\`\`\`csharp
public static void CreateRibbon(UIControlledApplication app, bool isLicensed)
{
    // ... code hiện tại ...

    // Thêm tab mới
    string bsTabName = "SIMPLEBIM.BS";
    try
    {
        app.CreateRibbonTab(bsTabName);
    }
    catch { }  // Ignore nếu tab đã tồn tại

    // Tạo panels cho tab
    Panels.BsPanel.Create(app, bsTabName, isLicensed);
}
\`\`\`

**Bước 4: Build và test**
- Build Solution (Ctrl+Shift+B)
- Mở Revit để kiểm tra tab mới`,
      keywords: ["ribbon", "tab", "tạo mới", "RibbonManager", "CreateRibbonTab"]
    },

    // ==================== ICONS ====================
    {
      id: "icon-01",
      category: "icon",
      title: "Cách tạo và thêm Icon cho Button",
      content: `**Yêu cầu icon:**
- Format: PNG với nền trong suốt (transparent)
- 2 kích thước: 32x32 (large) và 16x16 (small)
- Tên file: TênCommand32.png và TênCommand16.png

**Bước 1: Chuẩn bị file icon**
1. Tạo hoặc tải icon PNG
2. Dùng https://www.iloveimg.com/resize-image để resize
   - Resize về 32x32 → lưu MyCommand32.png
   - Resize về 16x16 → lưu MyCommand16.png

**Bước 2: Thêm icon vào project trong Visual Studio 2022**
1. Solution Explorer → chuột phải SimpleBIM/Icons/32/
2. Add → Existing Item...
3. Chọn file MyCommand32.png → Add
4. Lặp lại cho Icons/16/

**Bước 3: Set Build Action = Embedded Resource**
1. Click vào file icon trong Solution Explorer
2. Nhấn F4 để mở Properties window
3. Build Action → chọn "Embedded Resource"
4. Copy to Output Directory → "Do not copy"

**Bước 4: Load icon trong code Panel**
\`\`\`csharp
// Trong file Panel (AsPanel.cs, MEPFPanel.cs, ...)
App.LoadIconToButton(btnMyCommand, "MyCommand");
// Tự động load MyCommand32.png và MyCommand16.png
\`\`\``,
      keywords: ["icon", "png", "embedded resource", "32x32", "16x16", "button"]
    },

    // ==================== VERSION ====================
    {
      id: "version-01",
      category: "version",
      title: "Cách cập nhật phiên bản (Version)",
      content: `**Có 2 cách để đổi version:**

**Cách 1: Sửa ForceVersion.cs (KHUYẾN NGHỊ)**

1. Mở SimpleBIM/Update/ForceVersion.cs
2. Tìm dòng:
\`\`\`csharp
public static Version ForcedVersion = new Version("1.2.3");
\`\`\`
3. Đổi thành version mới:
\`\`\`csharp
public static Version ForcedVersion = new Version("1.2.4");
\`\`\`
4. Lưu file (Ctrl+S)

**Cách 2: Sửa AssemblyInfo.cs**

1. Solution Explorer → SimpleBIM → Properties → AssemblyInfo.cs
2. Tìm các dòng:
\`\`\`csharp
[assembly: AssemblyVersion("1.2.3.0")]
[assembly: AssemblyFileVersion("1.2.3.0")]
\`\`\`
3. Đổi thành:
\`\`\`csharp
[assembly: AssemblyVersion("1.2.4.0")]
[assembly: AssemblyFileVersion("1.2.4.0")]
\`\`\`

**Quy tắc đặt version (Semantic Versioning):**
- Major.Minor.Patch (ví dụ: 1.2.4)
- Major: Thay đổi lớn, breaking changes
- Minor: Thêm tính năng mới
- Patch: Sửa lỗi nhỏ`,
      keywords: ["version", "phiên bản", "ForceVersion", "AssemblyInfo", "semantic"]
    },

    // ==================== BUILD ====================
    {
      id: "build-01",
      category: "build",
      title: "Hướng dẫn Build Project trong Visual Studio 2022",
      content: `**Quy trình Build SimpleBIM:**

**Bước 1: Chọn Configuration = Release**
1. Trên toolbar, tìm dropdown "Debug"
2. Đổi thành "Release"

**Bước 2: Clean Solution**
1. Menu Build → Clean Solution
2. Đợi hoàn tất (xem Output window)

**Bước 3: Build hoặc Rebuild Solution**
1. Menu Build → Rebuild Solution
   - Hoặc nhấn Ctrl+Shift+B
2. Đợi build hoàn tất

**Bước 4: Kiểm tra kết quả**
1. Xem Output window: "Build succeeded" hoặc "Build failed"
2. Kiểm tra file output/SimpleBIM.dll đã được tạo
3. Kiểm tra Error List không có errors (warnings OK)

**Vị trí file sau build:**
- SimpleBIM/bin/Release/SimpleBIM.dll
- File này được copy tự động sang output/SimpleBIM.dll

**Nếu build failed:**
1. Mở Error List (Ctrl+\\, E)
2. Double-click vào error để đến dòng lỗi
3. Sửa lỗi và build lại`,
      keywords: ["build", "release", "rebuild", "clean", "output", "dll"]
    },

    // ==================== OBFUSCATION ====================
    {
      id: "obfuscate-01",
      category: "obfuscation",
      title: "Làm rối mã nguồn với ConfuserEx",
      content: `**Obfuscation là gì?**
Làm rối (obfuscate) mã nguồn để bảo vệ code khỏi bị decompile và đọc trộm.

**Quy trình làm rối với ConfuserEx:**

**Bước 1: Mở ConfuserEx**
- Mở thư mục ConfuserEx-GUI/
- Chạy ConfuserEx.exe

**Bước 2: Thêm file DLL**
1. Tab "Project"
2. Kéo thả file output/SimpleBIM.dll vào
   - Hoặc click "+" → Browse → chọn file

**Bước 3: Cấu hình**
1. Tab "Settings"
2. Trong "Rules", chọn preset: "Maximum"
3. Các protection được bật:
   - Anti Debug
   - Anti Dump
   - Anti IL Dasm
   - Constants
   - Control Flow
   - Invalid Metadata
   - Name Obfuscation (Rename)
   - Reference Proxy
   - Resources

**Bước 4: Thiết lập Output**
1. Base Path: Chọn thư mục output/
2. Output Directory: Confused/

**Bước 5: Chạy Protect**
1. Tab "Protect!"
2. Click nút "Protect!"
3. Đợi hoàn tất (màu xanh = thành công)

**Kết quả:**
- File gốc: output/SimpleBIM.dll
- File đã rối: output/Confused/SimpleBIM.dll

**QUAN TRỌNG:** Luôn dùng file trong Confused/ để phát hành!`,
      keywords: ["obfuscate", "confuserex", "protect", "bảo vệ", "làm rối", "dll"]
    },

    // ==================== ZIP RELEASE ====================
    {
      id: "zip-01",
      category: "release",
      title: "Tạo file ZIP để phát hành",
      content: `**Quy trình tạo file ZIP release:**

**Bước 1: Tạo thư mục release**
1. Tạo folder mới: SimpleBIM_v1.2.4/
2. Hoặc dùng tên khác theo quy ước của bạn

**Bước 2: Copy các file cần thiết**
Copy vào folder SimpleBIM_v1.2.4/:

1. **SimpleBIM.dll** (đã obfuscate)
   - Từ: output/Confused/SimpleBIM.dll
   
2. **Installer.exe**
   - Từ: SimpleBIM.Installer/bin/Release/SimpleBIM.Installer.exe

**Bước 3: Nén thành ZIP**
1. Chuột phải folder SimpleBIM_v1.2.4/
2. Send to → Compressed (zipped) folder
3. Hoặc dùng 7-Zip: Add to archive... → Format: zip

**Bước 4: Đặt tên file ZIP**
- Tên: SimpleBIM_v1.2.4.zip
- Đặt ở vị trí dễ tìm

**Bước 5: Tính mã hash SHA256**

Mở PowerShell (Windows+X → Windows PowerShell), chạy:

\`\`\`powershell
Get-FileHash -Algorithm SHA256 "C:\\path\\to\\SimpleBIM_v1.2.4.zip"
\`\`\`

Kết quả ví dụ:
\`\`\`
Algorithm       Hash
---------       ----
SHA256          A1B2C3D4E5F6...
\`\`\`

**Lưu lại mã Hash này để dùng khi cập nhật website!**`,
      keywords: ["zip", "release", "đóng gói", "sha256", "hash", "powershell"]
    },

    // ==================== GITHUB RELEASE ====================
    {
      id: "github-01",
      category: "github",
      title: "Đẩy file lên GitHub Release",
      content: `**Quy trình tạo Release trên GitHub:**

**Bước 1: Truy cập repository**
1. Mở trình duyệt
2. Vào https://github.com/YOUR_USERNAME/YOUR_REPO
3. Đăng nhập nếu cần

**Bước 2: Tạo Release mới**
1. Click tab "Releases" (bên phải)
2. Click "Draft a new release"

**Bước 3: Điền thông tin**
1. **Tag version**: v1.2.4 (nhập và chọn "Create new tag")
2. **Release title**: SimpleBIM v1.2.4
3. **Describe this release**: Viết changelog
   \`\`\`
   ## Có gì mới trong v1.2.4
   
   ### Tính năng mới
   - Thêm command XYZ
   - Cải thiện giao diện ABC
   
   ### Sửa lỗi
   - Fix lỗi crash khi...
   - Fix lỗi không load được...
   \`\`\`

**Bước 4: Upload file ZIP**
1. Kéo file SimpleBIM_v1.2.4.zip vào vùng "Attach binaries"
2. Hoặc click "Attach binaries" → chọn file

**Bước 5: Publish**
1. Kiểm tra lại thông tin
2. Click "Publish release"

**Bước 6: Lấy URL download**
1. Sau khi publish, click vào file ZIP
2. Copy URL (dạng: https://github.com/.../releases/download/v1.2.4/SimpleBIM_v1.2.4.zip)

**Lưu URL này để cập nhật trên website!**`,
      keywords: ["github", "release", "upload", "tag", "publish", "download url"]
    },

    // ==================== WEBSITE UPDATE ====================
    {
      id: "website-01",
      category: "website",
      title: "Cập nhật phiên bản trên Website Admin",
      content: `**Sau khi có URL GitHub và SHA256, cập nhật website:**

**Bước 1: Đăng nhập Admin**
1. Truy cập website admin (ví dụ: https://simplebim.vercel.app/admin)
2. Đăng nhập với tài khoản admin

**Bước 2: Vào trang Updates Management**
1. Menu trái → "Quản lý cập nhật" hoặc /admin/updates

**Bước 3: Tạo phiên bản mới**
1. Click nút "Phiên bản mới" hoặc "New Version"
2. Điền thông tin:
   - **Version**: 1.2.4
   - **Download URL**: Paste URL từ GitHub Release
   - **SHA256 Checksum**: Paste mã hash từ PowerShell
   - **Release Notes**: Viết ghi chú (có thể copy từ GitHub)
   - **Update Type**: 
     - Optional: Không bắt buộc
     - Recommended: Khuyến nghị
     - Mandatory: Bắt buộc cập nhật
   - **Force Update**: Bật nếu muốn ép user phải update

**Bước 4: Publish**
1. Click "Phát hành" hoặc "Publish"
2. Kiểm tra: Version mới xuất hiện trong danh sách

**Bước 5: Test**
1. Mở Revit có SimpleBIM cũ
2. Add-in sẽ tự kiểm tra và thông báo có bản mới
3. User click "Cập nhật" → Download và cài đặt tự động

**Lưu ý:** SHA256 checksum rất quan trọng! Add-in sẽ verify file sau khi download.`,
      keywords: ["website", "admin", "update", "publish", "sha256", "version"]
    },

    // ==================== QUY TRÌNH TỔNG HỢP ====================
    {
      id: "workflow-01",
      category: "workflow",
      title: "Quy trình phát hành phiên bản mới - Tổng hợp",
      content: `**Checklist phát hành phiên bản mới SimpleBIM:**

**1️⃣ Chuẩn bị code**
- [ ] Hoàn thành code chức năng mới/sửa lỗi
- [ ] Test kỹ trong Revit
- [ ] Commit code lên Git (nếu dùng)

**2️⃣ Cập nhật Version**
- [ ] Sửa ForceVersion.cs → Version mới (ví dụ: 1.2.4)
- [ ] Lưu file (Ctrl+S)

**3️⃣ Build Release**
- [ ] Configuration = Release
- [ ] Build → Clean Solution
- [ ] Build → Rebuild Solution
- [ ] Kiểm tra output/SimpleBIM.dll tồn tại

**4️⃣ Obfuscate**
- [ ] Mở ConfuserEx.exe
- [ ] Add module: output/SimpleBIM.dll
- [ ] Output: output/Confused/
- [ ] Click Protect!
- [ ] Verify: output/Confused/SimpleBIM.dll

**5️⃣ Tạo ZIP**
- [ ] Tạo folder SimpleBIM_v1.2.4/
- [ ] Copy: output/Confused/SimpleBIM.dll
- [ ] Copy: SimpleBIM.Installer/bin/Release/SimpleBIM.Installer.exe
- [ ] Nén thành SimpleBIM_v1.2.4.zip
- [ ] Chạy Get-FileHash → Lưu SHA256

**6️⃣ GitHub Release**
- [ ] Draft new release
- [ ] Tag: v1.2.4
- [ ] Upload ZIP file
- [ ] Write changelog
- [ ] Publish release
- [ ] Copy download URL

**7️⃣ Website Admin**
- [ ] Đăng nhập admin
- [ ] Tạo version mới
- [ ] Paste URL + SHA256 + Release notes
- [ ] Publish

**8️⃣ Test**
- [ ] Mở Revit → Kiểm tra thông báo update
- [ ] Download và cài đặt test`,
      keywords: ["quy trình", "workflow", "checklist", "phát hành", "release", "tổng hợp"]
    },

    // ==================== LICENSE SYSTEM ====================
    {
      id: "license-01",
      category: "license",
      title: "Hệ thống License - Cách hoạt động",
      content: `**License system trong SimpleBIM:**

**Luồng kích hoạt license:**
1. User mở Revit → SimpleBIM load
2. App.OnStartup() gọi LicenseManager.ValidateOffline()
3. Nếu chưa có license → Hiển thị LicenseWindow
4. User nhập key → ValidateOnlineAsync() gọi API
5. Server verify: key tồn tại, active, chưa hết hạn
6. Server ghi machine_hash để bind license với máy
7. Client lưu file license.json (encrypted AES-256)

**Offline validation:**
- Đọc file %AppData%/SimpleBIM/license.json
- Decrypt bằng AES-256 với key derived từ machine
- Kiểm tra expired_at > now
- Kiểm tra machine_hash match

**Machine hash:**
- Tính từ: CPU ID + MAC Address + HDD Serial
- Đảm bảo 1 key chỉ dùng trên 1 máy

**File LicenseManager.cs chứa:**
- ValidateOffline(): Kiểm tra file local
- ValidateOnlineAsync(): Gọi API validate
- GetMachineHash(): Tính machine hash
- SaveLicense(): Encrypt và lưu file

**API endpoint:**
- POST /keys/validate
- Body: { key_value, machine_hash, revit_version, os_version }`,
      keywords: ["license", "kích hoạt", "validate", "machine hash", "AES", "offline"]
    },

    // ==================== UPDATE SYSTEM ====================
    {
      id: "update-01",
      category: "update",
      title: "Hệ thống Auto Update - Cách hoạt động",
      content: `**Auto Update system trong SimpleBIM:**

**Luồng kiểm tra update:**
1. App.OnStartup() khởi động background task
2. UpdateService.CheckForUpdatesAsync()
3. POST /updates/check với:
   - current_version: Version hiện tại
   - revit_version: 2024
   - os_version: Windows 10
4. Server trả về:
   - has_update: true/false
   - latest_version: "1.2.4"
   - download_url: URL GitHub
   - release_notes: Changelog
   - checksum_sha256: Mã hash
5. Nếu has_update → Hiển thị UpdateNotificationWindow

**Luồng download và cài đặt:**
1. User click "Cập nhật ngay"
2. Download ZIP từ download_url
3. Verify SHA256 checksum
4. Extract to temp folder
5. Backup current DLL
6. Replace files trong Addins folder
7. Thông báo "Khởi động lại Revit"

**Các file quan trọng:**
- UpdateService.cs: Logic download/verify/apply
- VersionManager.cs: So sánh versions
- UpdateNotificationWindow.xaml: UI thông báo
- appsettings.json: Config API URL

**API endpoint:**
- POST /updates/check - Kiểm tra version mới
- GET /updates/download/{version} - Download file`,
      keywords: ["update", "auto update", "download", "checksum", "verify", "UpdateService"]
    },

    // ==================== TROUBLESHOOTING ====================
    {
      id: "error-01",
      category: "troubleshooting",
      title: "Xử lý lỗi Build thường gặp",
      content: `**Các lỗi build phổ biến và cách khắc phục:**

**1. "Type or namespace 'xxx' could not be found"**
- Nguyên nhân: Thiếu reference hoặc using
- Khắc phục:
  - Thêm using ở đầu file: \`using Autodesk.Revit.DB;\`
  - Hoặc chuột phải tên → Quick Actions → Add using

**2. "The name 'xxx' does not exist in current context"**
- Nguyên nhân: Chưa khai báo biến
- Khắc phục: Kiểm tra tên biến, scope

**3. "Cannot implicitly convert type"**
- Nguyên nhân: Sai kiểu dữ liệu
- Khắc phục: Cast hoặc chuyển đổi đúng type

**4. "Object reference not set to an instance"**
- Nguyên nhân: Null reference
- Khắc phục: Kiểm tra null trước khi dùng
  \`\`\`csharp
  if (element != null)
  {
      // Xử lý
  }
  \`\`\`

**5. "Unable to load assembly 'RevitAPI'"**
- Nguyên nhân: Reference sai phiên bản Revit
- Khắc phục: 
  - References → Remove RevitAPI.dll
  - Add Reference → Browse → C:\\Program Files\\Autodesk\\Revit 2024\\RevitAPI.dll

**6. Build thành công nhưng DLL không được copy**
- Nguyên nhân: Post-build event lỗi
- Khắc phục: Kiểm tra Project Properties → Build Events`,
      keywords: ["error", "lỗi", "build", "troubleshooting", "khắc phục", "debug"]
    },

    {
      id: "error-02",
      category: "troubleshooting",
      title: "Xử lý lỗi khi chạy Add-in trong Revit",
      content: `**Lỗi runtime trong Revit:**

**1. Add-in không load**
- Kiểm tra file .addin đúng vị trí:
  %AppData%\\Autodesk\\Revit\\Addins\\2024\\SimpleBIM.addin
- Kiểm tra nội dung .addin có đúng path DLL

**2. Command không hoạt động**
- Kiểm tra license đã kích hoạt chưa
- Kiểm tra button có bị disable không
- Xem Revit journal file để debug

**3. Transaction error**
- "Modifications outside of transaction are not permitted"
- Đảm bảo mọi thay đổi model nằm trong transaction

**4. Exception khi chọn element**
- User cancel selection → OperationCanceledException
- Xử lý:
  \`\`\`csharp
  try
  {
      Reference r = uidoc.Selection.PickObject(...);
  }
  catch (Autodesk.Revit.Exceptions.OperationCanceledException)
  {
      return Result.Cancelled;
  }
  \`\`\`

**5. Update không hoạt động**
- Kiểm tra kết nối internet
- Kiểm tra URL trong appsettings.json
- Xem log file: %AppData%\\SimpleBIM\\Logs\\

**Debug tips:**
- Dùng TaskDialog.Show() để hiển thị giá trị
- Xem Output window trong VS khi Attach to Process
- Kiểm tra Revit journal file`,
      keywords: ["runtime", "error", "revit", "transaction", "debug", "journal"]
    },

    // ==================== INSTALLER ====================
    {
      id: "installer-01",
      category: "installer",
      title: "Cách hoạt động của SimpleBIM.Installer",
      content: `**SimpleBIM.Installer là Console Application cài đặt Add-in:**

**Chức năng:**
1. Detect các phiên bản Revit đã cài (2018-2026)
2. Copy SimpleBIM.dll vào đúng thư mục Addins
3. Tạo file .addin để Revit load Add-in

**Vị trí cài đặt:**
\`\`\`
%AppData%\\Autodesk\\Revit\\Addins\\2024\\
├── SimpleBIM/
│   └── SimpleBIM.dll
└── SimpleBIM.addin
\`\`\`

**Nội dung file .addin:**
\`\`\`xml
<?xml version="1.0" encoding="utf-8"?>
<RevitAddIns>
  <AddIn Type="Application">
    <Assembly>SimpleBIM\\SimpleBIM.dll</Assembly>
    <ClientId>YOUR-GUID-HERE</ClientId>
    <FullClassName>SimpleBIM.App</FullClassName>
    <Name>SimpleBIM</Name>
    <VendorId>SimpleBIM</VendorId>
  </AddIn>
</RevitAddIns>
\`\`\`

**Cách build Installer:**
1. Solution Explorer → SimpleBIM.Installer
2. Build → Build SimpleBIM.Installer
3. Output: SimpleBIM.Installer/bin/Release/SimpleBIM.Installer.exe

**User sử dụng:**
1. Giải nén ZIP
2. Chạy SimpleBIM.Installer.exe
3. Chọn "Install" hoặc "Uninstall"
4. Installer tự detect Revit versions
5. Done!`,
      keywords: ["installer", "cài đặt", "addin", "revit", "appdata"]
    }
  ],

  // ==================== FEW-SHOT EXAMPLES ====================
  fewShotExamples: [
    {
      question: "Làm sao để tạo command mới?",
      answer: "Trong Visual Studio 2022: Chuột phải SimpleBIM/Commands/As/ → Add → Class → đặt tên. Implement interface IExternalCommand với method Execute(). Nhớ thêm [Transaction(TransactionMode.Manual)] attribute. Sau đó thêm button vào Ribbon trong file AsPanel.cs."
    },
    {
      question: "Cách build project?",
      answer: "Trong Visual Studio 2022: 1) Chọn Configuration = Release trên toolbar. 2) Menu Build → Clean Solution. 3) Build → Rebuild Solution. 4) Kiểm tra Output window và Error List. File DLL sẽ nằm ở output/SimpleBIM.dll."
    },
    {
      question: "Làm sao để đổi version?",
      answer: "Mở SimpleBIM/Update/ForceVersion.cs, sửa dòng: public static Version ForcedVersion = new Version(\"1.2.4\"); Thay 1.2.4 bằng version mới. Lưu file Ctrl+S."
    },
    {
      question: "Cách làm rối code?",
      answer: "Mở ConfuserEx-GUI/ConfuserEx.exe. Kéo thả file output/SimpleBIM.dll vào. Tab Settings chọn preset Maximum. Output Directory = Confused. Tab Protect! → click Protect! Kết quả: output/Confused/SimpleBIM.dll."
    },
    {
      question: "Cách upload lên GitHub Release?",
      answer: "Vào GitHub repo → Releases → Draft new release. Tag: v1.2.4. Upload file ZIP. Write changelog. Click Publish release. Copy download URL của file ZIP để dùng cho website."
    },
    {
      question: "Cách tính SHA256?",
      answer: "Mở PowerShell, chạy: Get-FileHash -Algorithm SHA256 \"C:\\path\\to\\SimpleBIM_v1.2.4.zip\". Copy mã hash để paste vào website admin khi tạo version mới."
    },
    {
      question: "Cách cập nhật website?",
      answer: "Đăng nhập admin → Quản lý cập nhật → Phiên bản mới. Điền: Version, Download URL (từ GitHub), SHA256 (từ PowerShell), Release notes. Click Phát hành."
    },
    {
      question: "Cách thêm icon cho button?",
      answer: "Chuẩn bị icon PNG 32x32 và 16x16. Thêm vào SimpleBIM/Icons/32/ và /16/. Trong Properties (F4): Build Action = Embedded Resource. Trong Panel code: App.LoadIconToButton(btn, \"IconName\");"
    }
  ]
};

export default ragData;
