import { MorphScroll } from "morphing-scroll";

function StorageColors() {
  return (
    <div className="storage-box">
      <div className="group-menu">
        <select value="group1">
          <option value="group1">group1</option>
        </select>
      </div>

      <div className="scroll-wrap">
        <MorphScroll
          className="chatDaiting"
          size="auto"
          objectsSize={50}
          progressTrigger={{
            wheel: true,
            progressElement: <div className="scroll-thumb" />,
          }}
          wrapperAlign={"center"}
          edgeGradient
          direction="x"
        ></MorphScroll>
      </div>
    </div>
  );
}

StorageColors.displayName = "StorageColors";
export default StorageColors;
