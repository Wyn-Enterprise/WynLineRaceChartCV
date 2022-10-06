//22.08.24 version_2 Xinyue Fan

import '../style/visual.less';
import _rawData from './data.json';
import * as echarts from 'echarts';

export default class Visual extends WynVisual {
    private chart: any;
    private container: HTMLDivElement;
    private properties: any;
    private items: any;
    private isMock: any;

    constructor(dom: HTMLDivElement, host: VisualNS.VisualHost, options: VisualNS.IVisualUpdateOptions) {
        super(dom, host, options);
        this.container = dom;
        this.chart = echarts.init(dom);
    }

    public update(options: VisualNS.IVisualUpdateOptions) {

        const dataView = options.dataViews[0];
        const plainData = dataView?.plain;
        var real_data = [];
        var label_list = [];
        var category = "", valueField = "", series = "";
        if (dataView && plainData.profile.ActualValue.values.length && plainData.profile.Category.values.length && plainData.profile.Series.values.length) {
            const itemValues = plainData.profile.ActualValue.values[0].display;
            valueField = plainData.profile.ActualValue.values[0].name;
            const itemKeys = plainData.profile.Category.values[0].name;
            category = itemKeys;
            const itemLabels = plainData.profile.Series.values[0].name;
            series = itemLabels;
            real_data.push([valueField, series, category])
            plainData.data.forEach((dataPoint) => {
                var one_data = [];
                one_data.push(dataPoint[itemValues]);
                one_data.push(dataPoint[itemLabels]);
                one_data.push(dataPoint[itemKeys]);

                if (!(label_list.includes(dataPoint[itemLabels]))) {
                    label_list.push(dataPoint[itemLabels]);
                }
                real_data.push(one_data);
            });
        }
        this.properties = options.properties;
        this.render(real_data, label_list, valueField, category, series);
    }

    public render(real_data, label_list, valueField, category, series) {

        const options = this.properties;
        this.isMock = !real_data.length;
        this.container.style.opacity = this.isMock ? '0.5' : '1';
        this.chart.clear();

        var labels = [
            'Canada', 'Australia'];

        if (!this.isMock) {
            labels = label_list;
        }
        else {
            valueField = "Income";
            category = "Year";
            series = "Country";
        }

        const datasetWithFilters: echarts.DatasetComponentOption[] = [];
        const seriesList: echarts.SeriesOption[] = [];
        echarts.util.each(labels, function (label) {
            var datasetId = 'dataset_' + label;
            datasetWithFilters.push({
                id: datasetId,
                fromDatasetId: 'dataset_raw',
                transform: {
                    type: 'filter',
                    config: {
                        and: [
                            { dimension: series, '=': label }
                        ]
                    }
                }
            });
            seriesList.push({
                type: 'line',
                datasetId: datasetId,
                showSymbol: options.showSymbol,
                name: label,
                lineStyle: {
                    width: options.lineStyleWidth,
                    shadowBlur: options.showShadow ? 5 : 0,
                },
                endLabel: {
                    show: true,
                    formatter: function (params) {
                        let dataLabel = "";
                        if (options.showValue)
                            dataLabel = params.value[1] + ' : ' + params.value[0];
                        else
                            dataLabel = params.value[1];
                        return dataLabel;
                    }
                },
                labelLayout: {
                    moveOverlap: 'shiftY'
                },
                emphasis: {
                    focus: 'series'
                },
                encode: {
                    x: category,
                    y: valueField,
                    label: [series, valueField],
                    itemName: category,
                    tooltip: [valueField]
                }
            });
        });
        let option = {
            animationDuration: options.animationDuration,
            dataset: [
                {
                    id: 'dataset_raw',
                    source: this.isMock ? _rawData : real_data
                },
                ...datasetWithFilters
            ],
            tooltip: {
                order: 'valueDesc',
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                nameLocation: 'middle',
                show: options.showCategoryAxis,
                nameTextStyle: {
                    fontFamily: options.categoryAxisTextStyle.fontFamily,
                    fontSize: 16
                },
                axisLine: {
                    show: options.categoryAxisLine
                },
                axisTick: {
                    show: options.categoryAxisTickMark
                },
                axisLabel: {
                    show: options.categoryAxisTickLabel,
                    //margin: 10,
                    //align: 'center',                   
                    textStyle: {
                        fontSize: options.categoryAxisTextStyle.fontSize.substring(0, 2),
                        fontFamily: options.categoryAxisTextStyle.fontFamily,
                        fontWeight: options.categoryAxisTextStyle.fontWeight,
                        fontStyle: options.categoryAxisTextStyle.fontStyle,
                        color: options.categoryAxisTextStyle.color,

                    }
                },
            },
            yAxis: {
                show: options.showValueAxis,
                name: options.valueAxisTitle ? valueField : "",
                nameLocation: "middle",
                nameGap: 40,
                nameTextStyle: {
                    fontFamily: options.valueAxisTextStyle.fontFamily,
                    fontSize: 16
                },
                axisLine: {
                    show: options.valueAxisLine
                },
                axisTick: {
                    show: options.valueAxisTickMark
                },
                axisLabel: {
                    show: options.valueAxisTickLabel,
                    //margin: 10,
                    //align: 'center',                    
                    textStyle: {
                        fontSize: options.valueAxisTextStyle.fontSize.substring(0, 2),
                        fontFamily: options.valueAxisTextStyle.fontFamily,
                        fontWeight: options.valueAxisTextStyle.fontWeight,
                        fontStyle: options.valueAxisTextStyle.fontStyle,
                        color: options.valueAxisTextStyle.color,

                    }
                },
                splitLine: {
                    show: options.valueAxisGridline,
                    lineStyle: {
                        color: options.valueAxisGridlineColor
                    }
                }
            },
            legend: {
                data: [{
                    name: 'Increase',
                    fontSize: options.legendFontSize,
                    textStyle: { color: options.customPaletteColor[0].colorStops ? options.customPaletteColor[0].colorStops[0] : options.customPaletteColor[0] }
                }, {
                    name: 'Decrease',
                    fontSize: options.legendFontSize,
                    textStyle: { color: options.customPaletteColor[1].colorStops ? options.customPaletteColor[1].colorStops[0] : options.customPaletteColor[1] }
                }],
                show: options.customShowLegend,
                left: options.legendHorizontalPosition,
                top: options.legendVerticalPosition
            },
            grid: {
                right: 140
            },
            series: seriesList
        };
        this.chart.setOption(option);
    }

    public onDestroy(): void {

    }

    public onResize() {
        this.chart.resize();

    }

    public getInspectorHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
        return null;
    }

    public getActionBarHiddenState(options: VisualNS.IVisualUpdateOptions): string[] {
        return null;
    }

    public getColorAssignmentConfigMapping(dataViews: VisualNS.IDataView[]): VisualNS.IColorAssignmentConfigMapping {
        return null;
    }
}