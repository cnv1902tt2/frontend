import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* Guide page - Hướng dẫn chỉnh sửa & phát hành */
const Guide = () => {
  const [openSection, setOpenSection] = useState(null);
  const location = useLocation();

  // Define section content for matching search terms
  const sectionContent = {
    intro: 'Giới thiệu Cấu trúc dự án SimpleBIM mã nguồn C# NET Framework SimpleBIM.Installer ConfuserEx obfuscation Visual Studio 2022 Community workload NET desktop development',
    folders: 'Các thư mục chính Commands As MEPF Qs Kiến trúc WallsFromCAD FinishRoomsFloor Cơ điện DuctsFromCAD CreateSheets Định lượng ExportSchedules Ribbon Panels AsPanel MEPFPanel QsPanel Icons VersionManager',
    ribbon: 'Tạo ribbon tab mới Commands Bs RibbonManager CreateRibbonTab BsPanel Create',
    command: 'Tạo chỉnh sửa command Add Class MyNewCommand.cs namespace SimpleBIM.Commands.As IExternalCommand',
    icon: 'Tạo icon PNG nền trong suốt iloveimg resize 32x32 16x16 SimpleBIM Icons Embedded Resource Build Action',
    button: 'Thêm nút Ribbon panel PushButtonData btnMyNewCommand MEPFPanel panelCreation ToolTip LongDescription LoadIconToButton BsPanel',
    version: 'Chỉnh sửa version ForceVersion.cs ForcedVersion Version AssemblyInfo.cs AssemblyVersion',
    build: 'Build project configuration Release Clean Solution Rebuild Solution output SimpleBIM.dll',
    obfuscate: 'Obfuscation ConfuserEx Modules Add module Settings Preset Maximum Anti Debug Anti Dump Resources Rename Output Directory Confused Protect',
    zip: 'Tạo file ZIP SimpleBIM_v1.2.4 Confused SimpleBIM.dll Installer Compressed folder',
    github: 'GitHub Release repository Draft release Tag Title Release notes Upload Publish download URL SHA256 Get-FileHash PowerShell',
    website: 'Cập nhật website admin Updates Management New Version Download URL SHA256 is_mandatory Publish API updates check',
    summary: 'Tổng kết quy trình command icon Ribbon version Build Release Obfuscate ZIP GitHub SHA256 website auto-update',
    notes: 'Lưu ý quan trọng build Release obfuscate version backup SHA256 GitHub release URL Confused DLL Git',
  };

  // Handle highlight from search
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightTerm = params.get('highlight');

    if (highlightTerm) {
      const searchLower = highlightTerm.toLowerCase();
      
      // Find which section contains the search term
      let matchedSection = null;
      for (const [sectionId, content] of Object.entries(sectionContent)) {
        if (content.toLowerCase().includes(searchLower)) {
          matchedSection = sectionId;
          break;
        }
      }

      if (matchedSection) {
        setOpenSection(matchedSection);
        
        // Scroll to the section after a delay for accordion to open
        setTimeout(() => {
          // Find the accordion button for this section
          const accordionButtons = document.querySelectorAll('.accordion-button');
          let targetElement = null;
          
          accordionButtons.forEach(btn => {
            const sectionName = btn.closest('.accordion-item');
            if (sectionName) {
              const collapseDiv = sectionName.querySelector('.accordion-collapse');
              if (collapseDiv && collapseDiv.classList.contains('show')) {
                targetElement = sectionName;
              }
            }
          });

          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Highlight matching text in the accordion body
            const body = targetElement.querySelector('.accordion-body');
            if (body) {
              highlightText(body, highlightTerm);
            }
          }
        }, 200);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Highlight text in an element
  const highlightText = useCallback((element, searchTerm) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
    const nodesToHighlight = [];
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent;
      const searchLower = searchTerm.toLowerCase();
      const textLower = text.toLowerCase();
      
      if (textLower.includes(searchLower)) {
        nodesToHighlight.push(node);
      }
    }
    
    nodesToHighlight.forEach(node => {
      const text = node.textContent;
      const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
      const parts = text.split(regex);
      
      if (parts.length > 1) {
        const fragment = document.createDocumentFragment();
        parts.forEach(part => {
          if (part.toLowerCase() === searchTerm.toLowerCase()) {
            const mark = document.createElement('mark');
            mark.textContent = part;
            mark.style.cssText = 'background: #fef3c7; padding: 1px 4px; border-radius: 4px; animation: highlightPulse 1s ease-in-out 2;';
            fragment.appendChild(mark);
          } else {
            fragment.appendChild(document.createTextNode(part));
          }
        });
        node.parentNode.replaceChild(fragment, node);
      }
    });
  }, []);

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <>
      {/* Clean style - white background, no gradients */}
      <style>{`
        .step { 
          display: flex; 
          gap: 10px; 
          align-items: flex-start; 
          margin-bottom: 8px; 
        }
        .step .icon { 
          width: 26px; 
          height: 26px; 
          background: #3b82f6; 
          border-radius: 6px; 
          display: grid; 
          place-items: center; 
          font-weight: 700; 
          color: #FFFFFF; 
          flex-shrink: 0; 
          font-size: 0.8125rem;
        }
        /* Override accordion styles for clean look */
        .accordion-item { 
          border: 1px solid #e5e7eb; 
          border-radius: 8px !important; 
          margin-bottom: 8px;
          overflow: hidden;
        }
        .accordion-button { 
          background-color: #FFFFFF; 
          color: #1f2937;
          font-weight: 600;
        }
        .accordion-button:not(.collapsed) { 
          background-color: #f9fafb; 
          color: #3b82f6;
        }
        .accordion-body { 
          background-color: #FFFFFF; 
          color: #4b5563;
        }
        .accordion-body code { 
          background-color: #f3f4f6; 
          padding: 2px 6px; 
          border-radius: 4px; 
          color: #ef4444;
          font-size: 0.875rem;
        }
        .accordion-body pre { 
          background-color: #f9fafb; 
          border: 1px solid #e5e7eb; 
          border-radius: 6px; 
          padding: 12px; 
          margin: 10px 0;
          overflow-x: auto;
        }
        .accordion-body pre code { 
          background: none; 
          color: #374151;
          padding: 0;
        }
        @keyframes highlightPulse {
          0%, 100% { background-color: #fef3c7; }
          50% { background-color: #fde047; }
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0" style={{color: '#1f2937', fontWeight: '700'}}>Hướng dẫn chỉnh sửa & phát hành</h1>
          <Link className="btn btn-outline-secondary" to="/dashboard" style={{borderRadius: '6px'}}>← Quay về trang chủ</Link>
      </div>
      <p style={{color: '#6b7280', marginBottom: '20px'}}>Chuyển đổi đầy đủ từ hướng dẫn chi tiết. Mỗi bước đều ghi rõ thao tác chuột, vị trí menu và biểu tượng để bạn làm theo trong Visual Studio 2022, ConfuserEx, GitHub và website quản lý.</p>

      <div className="accordion" id="accGuide">
        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'intro' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('intro')}
            >
              1. Giới thiệu
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'intro' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p><strong>Cấu trúc dự án:</strong></p>
              <ul>
                <li>SimpleBIM: Mã nguồn chính (C# .NET Framework 4.8)</li>
                <li>SimpleBIM.Installer: Công cụ cài đặt</li>
                <li>ConfuserEx-GUI: Công cụ obfuscation</li>
              </ul>
              <p><strong>Yêu cầu:</strong> Visual Studio 2022 Community với workload .NET desktop development</p>
              <p>Hướng dẫn dành cho người mới: thêm chức năng, tạo ribbon, cập nhật version, phát hành.</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'folders' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('folders')}
            >
              2. Các thư mục chính
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'folders' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p><strong>SimpleBIM/Commands/</strong></p>
              <ul>
                <li>As/ - Kiến trúc (WallsFromCAD, FinishRoomsFloor...)</li>
                <li>MEPF/ - Cơ điện (DuctsFromCAD, CreateSheets...)</li>
                <li>Qs/ - Định lượng (ExportSchedules...)</li>
              </ul>
              <p><strong>SimpleBIM/Ribbon/Panels/</strong></p>
              <ul>
                <li>AsPanel.cs, MEPFPanel.cs, QsPanel.cs</li>
              </ul>
              <p><strong>SimpleBIM/Icons/</strong></p>
              <ul>
                <li>16/ - Icons 16x16px</li>
                <li>32/ - Icons 32x32px</li>
              </ul>
              <p><strong>SimpleBIM/Update/</strong></p>
              <ul>
                <li>VersionManager.cs - Quản lý version</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'ribbon' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('ribbon')}
            >
              3. Tạo ribbon (tab) mới
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'ribbon' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Tạo thư mục Commands/Bs (chuột phải → Add → New Folder)</span></div>
              <div className="step"><span className="icon">2</span><span>Tạo thư mục Ribbon/Panels/Bs</span></div>
              <div className="step"><span className="icon">3</span><span>Mở RibbonManager.cs, thêm code:</span></div>
              <pre><code>{`string bsTabName = "SIMPLEBIM.BS";
try { app.CreateRibbonTab(bsTabName); } catch { }
Panels.BsPanel.Create(app, bsTabName, isLicensed);`}</code></pre>
              <div className="step"><span className="icon">4</span><span>Lưu file (Ctrl+S)</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'command' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('command')}
            >
              4. Tạo/chỉnh sửa command
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'command' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Chuột phải Commands/As → Add → Class...</span></div>
              <div className="step"><span className="icon">2</span><span>Đặt tên file: MyNewCommand.cs</span></div>
              <div className="step"><span className="icon">3</span><span>Xóa code mặc định, dán code mới</span></div>
              <div className="step"><span className="icon">4</span><span>Kiểm tra namespace: <code>namespace SimpleBIM.Commands.As</code></span></div>
              <div className="step"><span className="icon">5</span><span>Kiểm tra class name trùng tên file: <code>public class MyNewCommand : IExternalCommand</code></span></div>
              <div className="step"><span className="icon">6</span><span>Lưu file (Ctrl+S)</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'icon' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('icon')}
            >
              5. Tạo icon
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'icon' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Chuẩn bị icon PNG, nền trong suốt</span></div>
              <div className="step"><span className="icon">2</span><span>Truy cập iloveimg.com/resize-image</span></div>
              <div className="step"><span className="icon">3</span><span>Resize 32x32 → tải về MyCommand32.png</span></div>
              <div className="step"><span className="icon">4</span><span>Resize 16x16 → tải về MyCommand16.png</span></div>
              <div className="step"><span className="icon">5</span><span>Copy 2 file vào SimpleBIM/Icons/32/ và /16/</span></div>
              <div className="step"><span className="icon">6</span><span>Trong VS: chuột phải Icons/32 → Add → Existing Item → chọn MyCommand32.png</span></div>
              <div className="step"><span className="icon">7</span><span>Lặp lại cho Icons/16</span></div>
              <div className="step"><span className="icon">8</span><span>Click file icon, cửa sổ Properties (F4): Build Action → Embedded Resource</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'button' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('button')}
            >
              6. Thêm nút vào Ribbon
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'button' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p><strong>Trường hợp 1: Thêm vào panel có sẵn</strong></p>
              <div className="step"><span className="icon">1</span><span>Mở MEPFPanel.cs (hoặc panel tương ứng)</span></div>
              <div className="step"><span className="icon">2</span><span>Tìm panel phù hợp (ví dụ: panelCreation)</span></div>
              <div className="step"><span className="icon">3</span><span>Dán code:</span></div>
              <pre><code>{`PushButtonData btnMyNew = new PushButtonData(
    "btnMyNewCommand",            // ID unique
    "My New\\nCommand",           // Tên hiển thị 2 dòng
    typeof(App).Assembly.Location, // DLL path
    "SimpleBIM.Commands.MEPF.MyNewCommand" // Namespace + class
);
btnMyNew.ToolTip = "Mô tả ngắn";
btnMyNew.LongDescription = "Mô tả chi tiết";
App.LoadIconToButton(btnMyNew, "MyCommand"); // Tên base icon
panelCreation.AddItem(btnMyNew);`}</code></pre>
              <div className="step"><span className="icon">4</span><span>Đảm bảo: ID unique, namespace đúng, icon base tìm 32/16</span></div>

              <p className="mt-3"><strong>Trường hợp 2: Tạo panel mới</strong></p>
              <div className="step"><span className="icon">1</span><span>Copy MEPFPanel.cs → đổi tên BsPanel.cs</span></div>
              <div className="step"><span className="icon">2</span><span>Add vào VS: Panels → Add → Existing Item → BsPanel.cs</span></div>
              <div className="step"><span className="icon">3</span><span>Ctrl+H: Find "MEPFPanel", Replace "BsPanel"</span></div>
              <div className="step"><span className="icon">4</span><span>Chỉnh panel title, namespace trong PushButtonData</span></div>
              <div className="step"><span className="icon">5</span><span>Đăng ký trong RibbonManager.cs như bước 3</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'version' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('version')}
            >
              7. Chỉnh sửa version
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'version' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p><strong>Cách 1: Dùng ForceVersion.cs (khuyến nghị)</strong></p>
              <div className="step"><span className="icon">1</span><span>Mở SimpleBIM/Update/ForceVersion.cs</span></div>
              <div className="step"><span className="icon">2</span><span>Tìm dòng: <code>public static Version ForcedVersion = new Version("1.2.3");</code></span></div>
              <div className="step"><span className="icon">3</span><span>Đổi thành version mới, ví dụ: <code>new Version("1.2.4")</code></span></div>
              <div className="step"><span className="icon">4</span><span>Lưu (Ctrl+S)</span></div>

              <p className="mt-3"><strong>Cách 2: Sửa AssemblyInfo.cs</strong></p>
              <div className="step"><span className="icon">1</span><span>SimpleBIM → Properties → AssemblyInfo.cs</span></div>
              <div className="step"><span className="icon">2</span><span>Tìm: <code>[assembly: AssemblyVersion("1.2.3")]</code></span></div>
              <div className="step"><span className="icon">3</span><span>Đổi thành version mới</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'build' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('build')}
            >
              8. Build project
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'build' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Chọn configuration: Release (dropdown trên toolbar)</span></div>
              <div className="step"><span className="icon">2</span><span>Menu Build → Clean Solution</span></div>
              <div className="step"><span className="icon">3</span><span>Menu Build → Rebuild Solution</span></div>
              <div className="step"><span className="icon">4</span><span>Đợi build xong, kiểm tra output/SimpleBIM.dll</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'obfuscate' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('obfuscate')}
            >
              9. Obfuscation với ConfuserEx
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'obfuscate' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Mở ConfuserEx-GUI/ConfuserEx.exe</span></div>
              <div className="step"><span className="icon">2</span><span>Tab Modules → Add module → chọn output/SimpleBIM.dll</span></div>
              <div className="step"><span className="icon">3</span><span>Tab Settings → Preset: Maximum</span></div>
              <div className="step"><span className="icon">4</span><span>Rules: Anti Debug, Anti Dump, Resources, Rename</span></div>
              <div className="step"><span className="icon">5</span><span>Tab Settings → Output Directory → chọn output/Confused/</span></div>
              <div className="step"><span className="icon">6</span><span>Tab Protect! → Click Protect!</span></div>
              <div className="step"><span className="icon">7</span><span>Đợi hoàn thành → kiểm tra output/Confused/SimpleBIM.dll</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'zip' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('zip')}
            >
              10. Tạo file ZIP
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'zip' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Tạo folder mới, ví dụ: SimpleBIM_v1.2.4/</span></div>
              <div className="step"><span className="icon">2</span><span>Copy output/Confused/SimpleBIM.dll vào folder</span></div>
              <div className="step"><span className="icon">3</span><span>Copy SimpleBIM.Installer/bin/Release/SimpleBIM.Installer.exe vào folder</span></div>
              <div className="step"><span className="icon">4</span><span>Chuột phải folder → Send to → Compressed folder</span></div>
              <div className="step"><span className="icon">5</span><span>Đổi tên: SimpleBIM_v1.2.4.zip</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'github' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('github')}
            >
              11. GitHub Release
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'github' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Truy cập repository GitHub</span></div>
              <div className="step"><span className="icon">2</span><span>Click Releases → Draft a new release</span></div>
              <div className="step"><span className="icon">3</span><span>Tag: v1.2.4, Title: SimpleBIM v1.2.4</span></div>
              <div className="step"><span className="icon">4</span><span>Mô tả release notes</span></div>
              <div className="step"><span className="icon">5</span><span>Upload SimpleBIM_v1.2.4.zip</span></div>
              <div className="step"><span className="icon">6</span><span>Click Publish release</span></div>
              <div className="step"><span className="icon">7</span><span>Copy download URL của file ZIP</span></div>
              <div className="step"><span className="icon">8</span><span>Tính SHA256 (PowerShell): <code>Get-FileHash SimpleBIM_v1.2.4.zip -Algorithm SHA256</code></span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'website' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('website')}
            >
              12. Cập nhật website
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'website' ? 'show' : ''}`}>
            <div className="accordion-body">
              <div className="step"><span className="icon">1</span><span>Đăng nhập trang admin</span></div>
              <div className="step"><span className="icon">2</span><span>Vào mục Updates Management</span></div>
              <div className="step"><span className="icon">3</span><span>Click New Version</span></div>
              <div className="step"><span className="icon">4</span><span>Nhập: Version (1.2.4), Download URL, SHA256</span></div>
              <div className="step"><span className="icon">5</span><span>Release notes, is_mandatory (nếu cần)</span></div>
              <div className="step"><span className="icon">6</span><span>Click Publish</span></div>
              <div className="step"><span className="icon">7</span><span>Kiểm tra API: GET /updates/check?current_version=1.2.3</span></div>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'summary' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('summary')}
            >
              13. Tổng kết quy trình
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'summary' ? 'show' : ''}`}>
            <div className="accordion-body">
              <ol>
                <li>Tạo/chỉnh sửa command (.cs file)</li>
                <li>Tạo icon (32x32 và 16x16)</li>
                <li>Thêm nút vào Ribbon (Panel.cs)</li>
                <li>Cập nhật version (ForceVersion.cs)</li>
                <li>Build Release (Clean + Rebuild)</li>
                <li>Obfuscate (ConfuserEx)</li>
                <li>Tạo ZIP (DLL + Installer)</li>
                <li>GitHub Release (tag + upload)</li>
                <li>Tính SHA256</li>
                <li>Cập nhật website admin</li>
                <li>Test auto-update trên client</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header">
            <button 
              className={`accordion-button ${openSection !== 'notes' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('notes')}
            >
              14. Lưu ý quan trọng
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'notes' ? 'show' : ''}`}>
            <div className="accordion-body">
              <ul>
                <li>✅ Luôn build Release trước khi obfuscate</li>
                <li>✅ Kiểm tra version trùng khớp ở mọi nơi</li>
                <li>✅ Test trên máy local trước khi release</li>
                <li>✅ Backup DLL cũ trước khi replace</li>
                <li>✅ SHA256 phải chính xác 100%</li>
                <li>✅ GitHub release URL phải public</li>
                <li>⚠️ Không sửa code sau khi obfuscate</li>
                <li>⚠️ Không commit Confused DLL lên Git</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Guide;
