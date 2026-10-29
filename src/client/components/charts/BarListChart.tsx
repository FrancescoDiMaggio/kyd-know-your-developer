import React from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { chartColors } from '../../theme'
import { Series, tooltipStyle } from './chart-style'

interface BarListChartProps {
    data: object[]
    categoryKey: string
    series: Series[]
    categoryWidth?: number
    rowHeight?: number
    valueFormatter?: (v: number) => string
    showValues?: boolean
}

// Barre orizzontali, singole o impilate (una riga per categoria).
export function BarListChart({
    data,
    categoryKey,
    series,
    categoryWidth = 160,
    rowHeight = 26,
    valueFormatter = (v) => String(v),
    showValues = series.length === 1,
}: BarListChartProps) {
    const stacked = series.length > 1
    const height = Math.max(120, data.length * rowHeight + (stacked ? 56 : 24))
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: showValues ? 48 : 12, bottom: 0, left: 0 }} barCategoryGap={4}>
                <CartesianGrid horizontal={false} stroke={chartColors.grid} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: chartColors.axis }} tickLine={false} axisLine={false} />
                <YAxis
                    type="category"
                    dataKey={categoryKey}
                    width={categoryWidth}
                    tick={{ fontSize: 11, fill: chartColors.axis }}
                    tickLine={false}
                    axisLine={{ stroke: chartColors.grid }}
                    tickFormatter={(v: string) => (v.length > 26 ? v.slice(0, 25) + '…' : v)}
                />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} contentStyle={tooltipStyle} formatter={(v, name) => [valueFormatter(v as number), name]} />
                {stacked && <Legend verticalAlign="top" height={28} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />}
                {series.map((s, i) => (
                    <Bar
                        key={s.key}
                        dataKey={s.key}
                        name={s.label}
                        stackId={stacked ? 'stack' : undefined}
                        fill={s.color}
                        stroke="#ffffff"
                        strokeWidth={stacked ? 1 : 0}
                        radius={!stacked || i === series.length - 1 ? [0, 4, 4, 0] : 0}
                        maxBarSize={18}
                    >
                        {showValues && (
                            <LabelList dataKey={s.key} position="right" formatter={(v: any) => valueFormatter(Number(v))} style={{ fontSize: 11, fill: '#3f3f46' }} />
                        )}
                    </Bar>
                ))}
            </BarChart>
        </ResponsiveContainer>
    )
}
