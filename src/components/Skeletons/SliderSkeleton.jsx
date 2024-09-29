import * as React from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import styles from "./SliderSkeleton.module.css"
export default function SliderSkeleton() {
  return (
    <div  className={styles.SliderSkeletonContainer}>
      <Skeleton   sx={{
          height: 200,
          width: '90%',
          borderRadius: "8px",
          marginTop: "-10rem",
          '@media (min-width: 700px)': {
            height: 500,
            marginTop: "-13rem",
          },
        }}  animation="wave" className={styles.SliderSkeletonContainer__Skeleton}/>
     
    </div>
  );
}
