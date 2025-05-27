import React, { useState, useRef } from 'react';
import { validateVideoFile } from '../utils/cameraUtils';

const VideoUploader = ({ onFileUpload, onClose }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file) => {
    try {
      validateVideoFile(file);
      setSelectedFile(file);
      setError(null);
    } catch (err) {
      setError(err.message);
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    try {
      await onFileUpload(selectedFile);
    } catch (err) {
      setError(err.message || '업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes('mp4')) return '🎬';
    if (fileType.includes('webm')) return '📹';
    if (fileType.includes('ogg')) return '🎞️';
    if (fileType.includes('avi')) return '📽️';
    if (fileType.includes('mov')) return '🎥';
    return '📺';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '32px',
        minWidth: '500px',
        maxWidth: '600px',
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.2)'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#000000'
          }}>
            비디오 파일 업로드
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666666'
            }}
          >
            ×
          </button>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {/* 드래그 앤 드롭 영역 */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? '#000000' : '#cccccc'}`,
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragOver ? '#f8f9fa' : '#ffffff',
            transition: 'all 0.2s ease',
            marginBottom: '24px'
          }}
        >
          <div style={{
            fontSize: '48px',
            marginBottom: '16px'
          }}>
            🎬
          </div>
          
          <div style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#000000',
            marginBottom: '8px'
          }}>
            파일을 여기에 드래그하거나 클릭하여 선택
          </div>
          
          <div style={{
            fontSize: '14px',
            color: '#666666',
            marginBottom: '16px'
          }}>
            MP4, WebM, OGG, AVI, MOV, WMV 파일 지원 (최대 500MB)
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* 선택된 파일 정보 */}
        {selectedFile && (
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                fontSize: '24px'
              }}>
                {getFileIcon(selectedFile.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#000000',
                  marginBottom: '4px'
                }}>
                  {selectedFile.name}
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: '#666666'
                }}>
                  {formatFileSize(selectedFile.size)} • {selectedFile.type}
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#666666',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* 비디오 미리보기 */}
            <div style={{
              marginTop: '12px'
            }}>
              <video
                src={URL.createObjectURL(selectedFile)}
                style={{
                  width: '100%',
                  maxHeight: '200px',
                  borderRadius: '8px',
                  backgroundColor: '#000000'
                }}
                controls
              />
            </div>
          </div>
        )}

        {/* 업로드 진행 상태 */}
        {isUploading && (
          <div style={{
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#1976d2',
              marginBottom: '8px'
            }}>
              업로드 중...
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#bbdefb',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#1976d2',
                animation: 'loading 1.5s ease-in-out infinite'
              }} />
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={isUploading}
            style={{
              padding: '12px 24px',
              backgroundColor: '#666666',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              opacity: isUploading ? 0.6 : 1
            }}
          >
            취소
          </button>
          
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedFile && !isUploading ? '#28a745' : '#cccccc',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: selectedFile && !isUploading ? 'pointer' : 'not-allowed'
            }}
          >
            {isUploading ? '업로드 중...' : '업로드'}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(0%); }
            100% { transform: translateX(100%); }
          }
        `}
      </style>
    </div>
  );
};

export default VideoUploader; 