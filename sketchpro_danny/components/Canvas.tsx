import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { DrawingState, Point } from '../types';

interface CanvasProps {
  width: number;
  height: number;
  drawingState: DrawingState;
}

const Canvas = forwardRef(({ width, height, drawingState }: CanvasProps, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const lastPoint = useRef<Point | null>(null);

  // 부모 컴포넌트에서 호출할 수 있는 함수들 정의
  useImperativeHandle(ref, () => ({
    getDataURL: () => {
      return canvasRef.current?.toDataURL('image/png') || '';
    },
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    },
    undo: () => {
      if (history.length > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (canvas && ctx) {
          const newHistory = [...history];
          const previousState = newHistory.pop(); // 현재 상태 제거
          const targetState = newHistory[newHistory.length - 1]; // 이전 상태

          if (targetState) {
            ctx.putImageData(targetState, 0, 0);
            setHistory(newHistory);
          } else {
            // 초기 상태로
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            setHistory([]);
          }
        }
      }
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        saveToHistory();
      }
    }
  }, []);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
    }
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    if (coords) {
      setIsDrawing(true);
      lastPoint.current = coords;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const currentPoint = getCoordinates(e);

    if (canvas && ctx && currentPoint) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      
      ctx.strokeStyle = drawingState.tool === 'eraser' ? '#ffffff' : drawingState.color;
      ctx.lineWidth = drawingState.lineWidth;
      
      ctx.stroke();
      lastPoint.current = currentPoint;
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      lastPoint.current = null;
      saveToHistory();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      className="touch-none cursor-crosshair w-full h-full"
    />
  );
});

export default Canvas;