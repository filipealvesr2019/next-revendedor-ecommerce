import * as React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import styles from "./CategorySubcategoriesSkeleton.module.css"
import { useMediaQuery } from '@mui/material';
export default function CategorySubcategoriesSkeleton() {
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const isMediumScreen = useMediaQuery('(min-width:769px) and (max-width:1024px)');
  const isLargeScreen = useMediaQuery('(min-width:1025px)');

  const getSkeletonRectangularStyle = () => {
    if (isSmallScreen) {
      return {
        width: '38vw',
        height: '30vh',
      };
    } else if (isMediumScreen) {
      return {
        width: '50vw',
        height: '30vh',
      };
    } else if (isLargeScreen) {
      return {
        width: '13vw',
        height: '40vh',
      };
    } else {
      return {
        width: '13vw',
        height: '40vh',
      };
    }
  };

  const skeletonRectangular = getSkeletonRectangularStyle();

  return (

    <div style={{
      display: "flex",
      justifyContent: "space-between",
      gap: "1rem"
    }}>








      <div  className={styles.skeletonContainer__A}>
        <div >
          <div style={{
            marginBottom: "3rem"
          }}>
            <Skeleton width={160} height={25} />

          </div>





          <div>

            <Skeleton width={160} height={25} />
            <Skeleton width={90} />
            <Skeleton width={80} />
            <Skeleton width={70} />
            <Skeleton width={90} />
          </div>



          <div style={{

            marginTop: "5rem"
          }}>

            <Skeleton width={160} height={25} />
            <Skeleton width={90} />
            <Skeleton width={80} />
            <Skeleton width={70} />
            <Skeleton width={90} />
            <Skeleton width={90} />
            <Skeleton width={80} />
            <Skeleton width={70} />
            <Skeleton width={90} />
            <Skeleton width={90} />
            <Skeleton width={80} />
            <Skeleton width={70} />
            <Skeleton width={90} />
          </div>


          <div style={{

            marginTop: "5rem"
          }}>
            <Skeleton width={160} height={25} />


            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1rem",
              marginTop: "2rem"
            }}>

              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="circular" width={40} height={40} />

            </div>
          </div>
          <div style={{

            marginTop: "5rem"
          }}>

            <Skeleton width={160} height={25} />
            <Skeleton width={90} />
            <Skeleton width={80} />
            <Skeleton width={70} />
            <Skeleton width={90} />
          </div>
        </div>
      </div>


      <div >

        <div style={{ display: "flex", justifyContent: "center", gap: "4rem", marginTop: "2rem", }}>
          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular}  />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular} />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular} />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular} />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>
        </div>


        <div style={{ display: "flex", justifyContent: "center", gap: "5rem", marginTop: "8rem" }}>
          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular} />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular} />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular} />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular} />
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>
        </div>


        <div style={{ display: "flex", justifyContent: "center", gap: "5rem", marginTop: "8rem" }}>
          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular}/>
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular}/>
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular}/>
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>

          <div style={{ textAlign: "center" }}>
            <Skeleton variant="rectangular" style={skeletonRectangular}/>
            <Skeleton width={80} />
            <Skeleton width={160} />
          </div>
        </div>

      </div>


    </div>
  );
}
