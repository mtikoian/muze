import { mergeRecursive } from 'muze-utils';
import { hasAxesConfigChanged } from './helper';

export const PROPS = {
    availableSpace: {},
    axisDimensions: {},
    axisComponentDimensions: {},
    config: {
        sanitization: (context, value) => {
            const oldConfig = Object.assign({}, context._config || {});
            const mockedOldConfig = mergeRecursive({}, oldConfig);
            value = mergeRecursive(mockedOldConfig, value);

            value.axisNamePadding = Math.max(value.axisNamePadding, 0);
            const shouldAxesScaleUpdate = hasAxesConfigChanged(
                value, oldConfig, ['interpolator', 'exponent', 'base', 'orientation']
            );
            const tickFormatter = context.getTickFormatter(value);

            if (shouldAxesScaleUpdate) {
                context._scale = context.createScale(value);
                context._axis = context.createAxis(value);
            }
            if (context._scale) {
                const scale = context._scale;
                const labelFunc = scale.ticks || scale.quantile || scale.domain;
                context.sanitizedTickFormatter = tickFormatter ?
                    tickFormatter(context.tickValues || context.axis().tickValues() || labelFunc()) :
                    null;
                // This method is used to set the padding between plots.
                context.updateAxisPadding = (padding) => {
                    if (typeof padding === 'number' && padding >= 0 && padding <= 1) {
                        context._scale.padding(padding);
                    }
                };
            }
            context.fetchTickFormatter = tickFormatter;

            const {
                labels,
                show,
                showInnerTicks,
                showOuterTicks,
                showAxisName
            } = value;
            context.renderConfig({
                labels,
                show,
                showInnerTicks,
                showOuterTicks,
                showAxisName
            });
            return value;
        }
    },
    renderConfig: {
        sanitization: (context, value) => {
            const oldConfig = Object.assign({}, context._renderConfig || {});
            value = mergeRecursive(oldConfig, value);
            return value;
        }
    },
    logicalSpace: {},
    mount: {
    },
    range: {
        sanitization: (context, value) => {
            context.scale().range(value);
            context.logicalSpace(null);
            return value;
        }
    },

    smartTicks: {},
    tickSize: {},
    maxTickSpaces: {}
};
