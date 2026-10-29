import React from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors } from '../../theme'
import { tooltipStyle } from './chart-style'

interface ColumnChartProps {
    data: object[]
    xKey: string
    yKey: string
    yLabel: string
    xFormatter?: (v: any) => string
    height?: number
    color?: string
}

// Colonne verticali a serie singola (es. prompt per giorno / per ora).
export function ColumnChart({
    data,
    xKey,
    yKey,
    yLabel,
    xFormatter,
    height = 240,
    color = chartColors.series[0],
}: ColumnChartProps) {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid vertical={false} stroke={chartColors.grid} />
                <XAxis
                    dataKey={xKey}
                    tickFormatter={xFormatter}
                    tick={{ fontSize: 11, fill: chartColors.axis }}
                    tickLine={false}
                    axisLine={{ stroke: chartColors.grid }}
                    interval="preserveStartEnd"
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={tooltipStyle}
                    labelFormatter={(v) => (xFormatter ? xFormatter(v) : String(v))}
                    formatter={(v) => [v as number, yLabel]}
                />
                <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
        </ResponsiveContainer>
    )
}
