import * as React from 'react';
import styles from './ClockInClockOut.module.scss';
import StopWatch from '../StopWatch/StopWatch'; 
import type { IClockInClockOutProps } from './IClockInClockOutProps';
const ClockInClockOut: React.FunctionComponent<IClockInClockOutProps> = (props: IClockInClockOutProps) => {
  return (
    <div className={styles.clockInClockOut}>
      <StopWatch absoluteURL={props.absoluteURL} spHttpClient={props.spHttpClient} listName={props.listName} backgroundColor={props.backgroundColor}/>
    </div>
  );
};

export default ClockInClockOut;