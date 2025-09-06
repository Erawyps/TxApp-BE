const colors = {
    primary: '#6366f1',
    secondary: '#F000B9',
    success: '#10B981',
    warning: '#FF9800',
    error: '#FF5724'
}

export function getChartConfig(color) {
    return {
        colors: [colors[color]],
        chart: {
            stacked: false,
            parentHeightOffset: 0,
            toolbar: {
                show: false,
            },
        },
        dataLabels: {
            enabled: false,
        },
        grid: {
            padding: {
                left: 0,
                right: 0,
                top: -20,
                bottom: 0,
            },
        },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                inverseColors: false,
                opacityFrom: 0.45,
                opacityTo: 0.1,
                stops: [20, 100, 100, 100],
            },
        },
        stroke: {
            width: 2,
        },
        tooltip: {
            shared: true,
        },
        legend: {
            show: false,
        },
        yaxis: {
            show: false,
        },
        xaxis: {
            labels: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
        },
    }
}
