import React, { useState, useRef } from 'react';
import "./ZoomIn.css"
const ZoomIn = ({selectedImageUrl}) => {
  const [state, setState] = useState({
    isZoomOnSide: true,
    showOverlay: false,
    overlayLeft: 0,
    overlayTop: 0,
    zoomInLeft: 0,
    zoomInTop: 0,
    zoomInMaxWidth: 0
  });

  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const zoomInImageRef = useRef(null);
  const zoomInWindowRef = useRef(null);

  const onMouseMove = (e) => {
    const overlayNode = overlayRef.current;
    const imageNode = imageRef.current;
    const zoomInImageNode = zoomInImageRef.current;
    const zoomInWindowNode = zoomInWindowRef.current;

    if (!overlayNode || !imageNode || !zoomInImageNode || !zoomInWindowNode) return;

    const zoomInWindowWidth = zoomInWindowNode.clientWidth;
    const overlayWidth = overlayNode.clientWidth || 200;
    const imageWidth = imageNode.clientWidth;
    const imageHeight = imageNode.clientHeight;
    const zoomInImageWidth = zoomInImageNode.clientWidth;
    const zoomInImageHeight = zoomInImageNode.clientHeight;
    const offsetLeft = imageNode.offsetLeft;
    const offsetTop = imageNode.offsetTop;

    const overlayLeft = Math.min(
      Math.max(
        e.clientX - overlayWidth / 2,
        offsetLeft
      ),
      offsetLeft + imageWidth - overlayWidth
    );

    const overlayTop = Math.min(
      Math.max(
        e.clientY - overlayWidth / 2,
        offsetTop
      ),
      offsetTop + imageHeight - overlayWidth
    );

    const zoomInLeft = -(overlayLeft - offsetLeft) / imageWidth * zoomInImageWidth;
    const zoomInTop = -(overlayTop - offsetTop) / imageHeight * zoomInImageHeight;
    const zoomInMaxWidth = zoomInWindowWidth / (overlayWidth / imageWidth);

    setState(prevState => ({
      ...prevState,
      overlayLeft,
      overlayTop,
      zoomInLeft,
      zoomInTop,
      zoomInMaxWidth
    }));
  };

  const toggleOverlay = (showOverlay) => () => {
    setState(prevState => ({
      ...prevState,
      showOverlay
    }));
  };

  const onSwitchButtonClick = () => {
    setState(prevState => ({
      ...prevState,
      isZoomOnSide: !prevState.isZoomOnSide
    }));
  };

  const {
    showOverlay,
    overlayLeft,
    overlayTop,
    zoomInLeft,
    zoomInTop,
    zoomInMaxWidth,
    isZoomOnSide
  } = state;

  const overlayStyle = {
    left: overlayLeft,
    top: overlayTop
  };

  const zoomInImageStyle = {
    left: zoomInLeft,
    top: zoomInTop
  };

  if (zoomInMaxWidth && isZoomOnSide) {
    zoomInImageStyle['maxWidth'] = `${zoomInMaxWidth}px`;
  }

  return (
    <div>
     
      <div
        className="OriginalImageContainer"
        onMouseMove={onMouseMove}
        onMouseEnter={toggleOverlay(true)}
        onMouseLeave={toggleOverlay(false)}
        style={{
          display:"flex",
          flexDirection:"row"

        }}
      >
        <img
          className="OriginalImage"
          ref={imageRef}
          src={selectedImageUrl}
        />

        <div>
        {showOverlay && isZoomOnSide && (
          <span
            ref={overlayRef}
            style={overlayStyle}
            className='application__spanStyle'
          />
        )}
        {showOverlay && !isZoomOnSide && (
          <div
            ref={zoomInWindowRef}
            className="ZoomInWindowInside"
          >
            <img
              className="ZoomInWindow-Image"
              ref={zoomInImageRef}
              style={zoomInImageStyle}
              src={selectedImageUrl}
            />
          </div>
        )}
      </div>
      {showOverlay && isZoomOnSide && (
        <div
          ref={zoomInWindowRef}
          className="ZoomInWindow"
        >
          <img
            className="ZoomInWindow-Image"
            ref={zoomInImageRef}
            style={zoomInImageStyle}
            src={selectedImageUrl}
            />
        </div>
      )}

          
        </div>
    </div>
  );
};

export default ZoomIn;
