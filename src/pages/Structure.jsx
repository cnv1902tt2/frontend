import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* Structure page - Cấu trúc dự án SimpleBIM */
const Structure = () => {
  const [openSection, setOpenSection] = useState('headingDesc');
  const location = useLocation();

  // Define section content for matching search terms
  const sectionContent = {
    headingDesc: 'Mô tả dự án SimpleBIM Revit Add-in License online offline Auto Update Ribbon UI lệnh đa ngành AS MEPF QS Obfuscation Installer',
    headingConfuser: 'ConfuserEx obfuscate DLL build Release SimpleBIM.dll bảo vệ đóng gói',
    headingOutput: 'output build Release SimpleBIM.dll dependencies Confused obfuscate Packaging',
    headingCore: 'SimpleBIM Core project App.cs Entry point IExternalApplication ShowLicenseCommand packages.config NuGet Commands Icons License Ribbon Update',
    headingCommands: 'Commands External Commands As WallsFromCAD FinishRoomsFloor MEPF DuctsFromCAD CreateSheets Qs ExportSchedules CheckForUpdatesCommand modeling data cleanup export import',
    headingIcons: 'Icons ribbon 16x16px 32x32px embed assembly LoadSingleIcon',
    headingLicense: 'License LicenseManager Singleton online offline validation AES-256 LicenseWindow WPF ValidateOffline ValidateOnlineAsync',
    headingRibbon: 'Ribbon RibbonManager tabs SIMPLEBIM.AS MEPF QS AsPanel MEPFPanel QsPanel',
    headingUpdate: 'Update UpdateService CheckForUpdatesAsync DownloadUpdateAsync ApplyUpdate VersionManager UpdateNotificationWindow UpdateConfiguration UpdateModels UpdateLogger appsettings.json API endpoint ZIP Extract Backup Replace Restart',
    headingInstaller: 'SimpleBIM.Installer Console Application Install Uninstall Program.cs DLL dependencies AppData Autodesk Revit Addins addin file',
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
          const sectionElement = document.getElementById(matchedSection);
          if (sectionElement) {
            sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Highlight matching text in the accordion body
            const accordionItem = sectionElement.closest('.accordion-item');
            if (accordionItem) {
              const body = accordionItem.querySelector('.accordion-body');
              if (body) {
                highlightText(body, highlightTerm);
              }
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
      {/* Clean style for accordion - white background */}
      <style>{`
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
          color: #374151;
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
          padding: 0;
          font-size: 0.875rem;
        }
        @keyframes highlightPulse {
          0%, 100% { background-color: #fef3c7; }
          50% { background-color: #fde047; }
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0" style={{color: '#1f2937', fontWeight: '700'}}>Cấu trúc dự án SimpleBIM</h1>
        <Link className="btn btn-outline-secondary" to="/admin/dashboard" style={{borderRadius: '6px'}}>← Quay về trang chủ</Link>
      </div>
      <p style={{color: '#6b7280', marginBottom: '20px'}}>Dưới đây là mô tả chi tiết về cấu trúc dự án SimpleBIM. Click vào từng phần để xem chi tiết.</p>

      <div className="accordion" id="accStructure">
        <div className="accordion-item">
          <h2 className="accordion-header" id="headingDesc">
            <button 
              className={`accordion-button ${openSection !== 'headingDesc' ? 'collapsed' : ''}`}
              type="button" 
              onClick={() => toggleSection('headingDesc')}
            >
              Mô tả dự án
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingDesc' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>SimpleBIM là Revit Add-in (C#) với các thành phần: License online/offline, Auto Update, Ribbon UI, nhiều lệnh đa ngành (AS/MEPF/QS), Obfuscation và Installer đa phiên bản.</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingConfuser">
            <button 
              className={`accordion-button ${openSection !== 'headingConfuser' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingConfuser')}
            >
              ConfuserEx-GUI/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingConfuser' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Mục đích: Chứa công cụ ConfuserEx để obfuscate DLL sau build.</p>
              <p>Workflow: Build Release → đưa SimpleBIM.dll vào ConfuserEx → tạo bản bảo vệ để đóng gói.</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingOutput">
            <button 
              className={`accordion-button ${openSection !== 'headingOutput' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingOutput')}
            >
              output/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingOutput' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Chứa kết quả build Release.</p>
              <ul>
                <li>SimpleBIM.dll và dependencies</li>
                <li>Confused/ - DLL đã obfuscate</li>
              </ul>
              <p>Vai trò: trung gian Build → Obfuscation → Packaging.</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingCore">
            <button 
              className={`accordion-button ${openSection !== 'headingCore' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingCore')}
            >
              SimpleBIM/ (Dự án chính)
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingCore' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Core project chứa mã nguồn Revit Add-in.</p>
              <ul>
                <li>App.cs - Entry point, implement IExternalApplication</li>
                <li>ShowLicenseCommand.cs - Hiển thị cửa sổ license</li>
                <li>packages.config - NuGet dependencies</li>
              </ul>
              <p className="mt-3">Thư mục con quan trọng:</p>
              <ul>
                <li>Commands/ - Các lệnh AS/MEPF/QS</li>
                <li>Icons/ - Icon 16x16 và 32x32</li>
                <li>License/ - Hệ thống license</li>
                <li>Ribbon/ - Ribbon UI manager</li>
                <li>Update/ - Auto update system</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingCommands">
            <button 
              className={`accordion-button ${openSection !== 'headingCommands' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingCommands')}
            >
              Commands/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingCommands' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Chứa tất cả External Commands:</p>
              <ul>
                <li>As/ - 10 commands kiến trúc (WallsFromCAD, FinishRoomsFloor...)</li>
                <li>MEPF/ - 13 commands cơ điện (DuctsFromCAD, CreateSheets...)</li>
                <li>Qs/ - 7 commands định lượng (ExportSchedules...)</li>
                <li>CheckForUpdatesCommand.cs</li>
              </ul>
              <p>Đặc điểm: tự động hóa modeling, data cleanup, export/import.</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingIcons">
            <button 
              className={`accordion-button ${openSection !== 'headingIcons' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingIcons')}
            >
              Icons/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingIcons' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Chứa icon ribbon:</p>
              <ul>
                <li>16/ - Icons 16x16px (small)</li>
                <li>32/ - Icons 32x32px (large)</li>
              </ul>
              <p>Icons được embed vào assembly và load động bởi App.LoadSingleIcon()</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingLicense">
            <button 
              className={`accordion-button ${openSection !== 'headingLicense' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingLicense')}
            >
              License/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingLicense' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Hệ thống quản lý license:</p>
              <ul>
                <li>LicenseManager.cs - Singleton, online/offline validation, AES-256</li>
                <li>LicenseWindow.xaml/.cs - WPF UI nhập license key</li>
              </ul>
              <p>Workflow: ValidateOffline → nếu invalid → show LicenseWindow → ValidateOnlineAsync → save encrypted</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingRibbon">
            <button 
              className={`accordion-button ${openSection !== 'headingRibbon' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingRibbon')}
            >
              Ribbon/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingRibbon' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Quản lý Ribbon UI:</p>
              <ul>
                <li>RibbonManager.cs - Tạo 3 tabs: SIMPLEBIM.AS, MEPF, QS</li>
                <li>Panels/AsPanel.cs - Ribbon cho AS</li>
                <li>Panels/MEPFPanel.cs - Ribbon cho MEPF</li>
                <li>Panels/QsPanel.cs - Ribbon cho QS</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingUpdate">
            <button 
              className={`accordion-button ${openSection !== 'headingUpdate' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingUpdate')}
            >
              Update/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingUpdate' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Hệ thống auto update:</p>
              <ul>
                <li>UpdateService.cs - CheckForUpdatesAsync, DownloadUpdateAsync, ApplyUpdate</li>
                <li>VersionManager.cs - Quản lý version hiện tại</li>
                <li>UpdateNotificationWindow.xaml/.cs - UI thông báo update</li>
                <li>UpdateConfiguration.cs, UpdateModels.cs, UpdateLogger.cs</li>
                <li>appsettings.json - API endpoint config</li>
              </ul>
              <p>Workflow: CheckForUpdates → UpdateNotificationWindow → Download ZIP → Extract → Backup → Replace → Restart</p>
            </div>
          </div>
        </div>

        <div className="accordion-item">
          <h2 className="accordion-header" id="headingInstaller">
            <button 
              className={`accordion-button ${openSection !== 'headingInstaller' ? 'collapsed' : ''}`}
              type="button"
              onClick={() => toggleSection('headingInstaller')}
            >
              SimpleBIM.Installer/
            </button>
          </h2>
          <div className={`accordion-collapse collapse ${openSection === 'headingInstaller' ? 'show' : ''}`}>
            <div className="accordion-body">
              <p>Console Application để cài đặt/gỡ SimpleBIM:</p>
              <ul>
                <li>Program.cs - Interactive menu Install/Uninstall</li>
                <li>Copy DLL + dependencies đến %AppData%/Autodesk/Revit/Addins/[Year]/</li>
                <li>Tạo SimpleBIM.addin file</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Luồng hoạt động tổng thể */}
      <div className="card mt-4" style={{borderRadius: '8px', border: '1px solid #e5e7eb'}}>
        <div className="card-body">
          <h5 className="card-title" style={{fontWeight: '600', color: '#1f2937'}}>Luồng hoạt động tổng thể</h5>
          <p style={{color: '#6b7280', marginBottom: '8px'}}>1) Startup</p>
          <pre style={{backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px'}}><code style={{color: '#374151', fontSize: '0.875rem'}}>{`User mở Revit → Revit đọc .addin → Load SimpleBIM.dll → App.OnStartup
- ValidateOffline (LicenseManager)
- RibbonManager.CreateRibbon (tab AS/MEPF/QS, enable theo isLicensed)
- Nếu chưa license: show LicenseWindow sau 600ms
- Background: CheckForUpdatesAsync → UpdateNotificationWindow nếu có bản mới`}</code></pre>
          
          <p style={{color: '#6b7280', marginBottom: '8px'}}>2) Sử dụng Commands</p>
          <pre style={{backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px'}}><code style={{color: '#374151', fontSize: '0.875rem'}}>{`User click nút trên Ribbon → IExternalCommand.Execute
- Kiểm tra selection/input → Transaction → Business logic (tạo Walls, Ducts, ...)
- Commit → Return Result.Succeeded/Failed`}</code></pre>
          
          <p style={{color: '#6b7280', marginBottom: '8px'}}>3) License Refresh</p>
          <pre style={{backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px'}}><code style={{color: '#374151', fontSize: '0.875rem'}}>{`Định kỳ 24h: đọc license.json (AES) → kiểm tra expired, machine hash
Nếu quá hạn online check: POST validate (key_value, machine_hash, revit_version, os_version)
Cập nhật cache; nếu invalid → disable buttons, mở LicenseWindow`}</code></pre>
          
          <p style={{color: '#6b7280', marginBottom: '8px'}}>4) Auto Update</p>
          <pre style={{backgroundColor: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '12px'}}><code style={{color: '#374151', fontSize: '0.875rem'}}>{`Startup/định kỳ → CheckForUpdates (VersionManager.CurrentVersion, POST /updates/check)
Nếu HasUpdate: show UpdateNotificationWindow (release notes)
User click Update Now → Download ZIP → Extract → Backup current DLL → Replace → Cleanup → Thông báo restart Revit`}</code></pre>
        </div>
      </div>
    </>
  );
};

export default Structure;
