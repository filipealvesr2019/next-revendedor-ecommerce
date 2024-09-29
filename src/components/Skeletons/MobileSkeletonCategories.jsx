import React from "react";
import "./MobileSkeletonCategories.css"; // Arquivo CSS onde você definiu a classe .skeleton

const MobileSkeletonCategories = () => {
  return (
    <>
      <div className="skeletonMobileContainer" style={{
        display:"flex"
      }}>
   
        <div className="Mobileskeleton"></div>
        <div className="Mobileskeleton"></div> 
    
      </div>
    </>
  );
};

export default MobileSkeletonCategories;
