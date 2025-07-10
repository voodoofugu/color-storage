import { MorphScroll } from "morphing-scroll";
import Button from "./Button";

function StorageColors() {
  return (
    <div className="storage-box">
      <div className="container">
        <div className="menu-wrap">
          <div className="menu">
            <select value="group1" onChange={() => {}}>
              <option value="group1">group1</option>
            </select>
          </div>

          <Button svgID="plus" className="menu-btn" onClick={() => {}} />
          <Button className="menu-btn text" text="rename" onClick={() => {}} />
        </div>

        <div className="scroll-wrap">
          <MorphScroll
            className="scroll"
            size="auto"
            objectsSize={30}
            wrapperMargin={12}
            gap={10}
            progressTrigger={{
              wheel: true,
              progressElement: <div className="scroll-thumb" />,
            }}
            wrapperAlign={["start", "center"]}
            edgeGradient
            direction="x"
          >
            <Button
              className="storage-btn add-color"
              svgID="plus"
              onClick={() => {}}
            />
            <Button
              className="storage-btn"
              color="yellow"
              bgColor
              onClick={() => {}}
            />
            <Button
              className="storage-btn default"
              // color={colorWithAlpha}
              onClick={() => {}}
            />
            <Button
              className="storage-btn default"
              // color={colorWithAlpha}
              onClick={() => {}}
            />
            <Button
              className="storage-btn default"
              // color={colorWithAlpha}
              onClick={() => {}}
            />
          </MorphScroll>

          <Button className="drag" svgID="drag" onClick={() => {}} />
        </div>
      </div>
    </div>
  );
}

StorageColors.displayName = "StorageColors";
export default StorageColors;
