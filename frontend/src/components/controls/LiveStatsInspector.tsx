import React from 'react';
import { WeatherReading } from '../../types';
import { SmaFilterInspector } from './SmaFilterInspector';
import { CorrelationFilterInspector } from './CorrelationFilterInspector';

export { SmaFilterInspector } from './SmaFilterInspector';
export { CorrelationFilterInspector } from './CorrelationFilterInspector';

interface LiveStatsInspectorProps {
  readings: WeatherReading[];
  defaultField?: keyof WeatherReading;
  defaultX?: keyof WeatherReading;
  defaultY?: keyof WeatherReading;
  defaultWindow?: number;
}

/**
 * Composite Real-Time Statistical & Filter Inspector container.
 * Renders the dedicated Instant SMA Low-Pass Filter and Instant Bivariate Correlation Filter
 * in a responsive side-by-side grid, each equipped with dedicated controls, live readouts,
 * and built-in interactive 'How to Use' scientific guidance.
 */
export const LiveStatsInspector: React.FC<LiveStatsInspectorProps> = ({
  readings,
  defaultField = 'temperature_2m',
  defaultX = 'temperature_2m',
  defaultY = 'relative_humidity',
  defaultWindow = 12,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="sr-only">Real-Time Statistical & Filter Inspector</div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 1. Instant SMA Low-Pass Filter Inspector */}
        <SmaFilterInspector
          readings={readings}
          defaultField={defaultField}
          defaultWindow={defaultWindow}
        />

        {/* 2. Instant Bivariate Correlation Filter Inspector */}
        <CorrelationFilterInspector
          readings={readings}
          defaultX={defaultX}
          defaultY={defaultY}
        />
      </div>
    </div>
  );
};

export default LiveStatsInspector;
