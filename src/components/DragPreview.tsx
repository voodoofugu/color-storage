import { createPortal } from "react-dom";

const DragPreview = ({
  imageSrc,
  position,
  style,
}: {
  imageSrc: string;
  position: { x: number; y: number };
  style?: React.CSSProperties;
}) => {
  return createPortal(
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -50%)",
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        zIndex: 9999,
        ...style,
      }}
    >
      <img
        src={imageSrc}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        alt=""
      />
    </div>,
    document.body
  );
};

export default DragPreview;
