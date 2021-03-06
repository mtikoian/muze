import { generateGetterSetters } from 'muze-utils';
import localOptions from './local-options';
import { SimpleGroup } from '../simple-group';
import {
    MatrixResolver,
    findInGroup
} from '../group-helper';
import { createUnitState, initializeGlobalState, setMatrixInstances, createMatrices, createLayerState } from './helper';
import { setupChangeListeners } from './change-listener';
import { PROPS } from './props';
import {
    CONFIG,
    MOUNT,
    RETINAL,
    Y
} from '../enums/constants';

/**
 * VisualGroup is instantiated by canvas for creating {@link VisualUnit} and axes instances.It creates the
 * the matrix of visual units and axes. It also creates the layout instance which manages the allocation
 * of space of matrices.
 *
 * To get instance of visual group,
 * ```
 *      const visualGroup = canvas.composition().visualGroup;
 * ```
 * @public
 *
 * @class VisualGroup
 */
class VisualGroup extends SimpleGroup {

    /**
     * Creates an instance of VisualGroup. Requires dependencies and other registry options for placeholders
     * and layers that create individual units.
     *
     * @param {Object} registry Key value pair of compostions for the group
     * @param {Object} dependencies Dependencies needed to run the group
     * @memberof VisualGroup
     */
    constructor (registry, dependencies) {
        super();

        const {
            componentSubRegistry
        } = registry;

        this._dependencies = dependencies;
        // Generate getter/setter methods for all properties of the class
        // One can get each property by calling the method and can set it
        // by passing paramaters for the same. Thus, one can chain setter
        // getter methods.
        generateGetterSetters(this, PROPS);
        generateGetterSetters(this, localOptions);
        // Populate the store with default values
        // initialize group compositions
        this._composition = {};
        // store reference to data
        this._data = [];
        // store reference to mountpoint
        this._mount = null;
        // selection object that takes care of updating of components
        this._selection = {};
        // Create instance of matrix resolver
        this.resolver(new MatrixResolver(this._dependencies));
        // matrix instance store each of the matrices
        setMatrixInstances(this, {});
         // Getting indiviual registered items
        this.registry({
            layerRegistry: componentSubRegistry.layerRegistry.get(),
            cellRegistry: componentSubRegistry.cellRegistry.get()
        });
    }

    static getState () {
        return [{
            domain: {
                x: {},
                y: {},
                radius: {},
                angle: {},
                angle0: {}
            }
        }, {}];
    }

    store (...params) {
        if (params.length) {
            this._store = params[0];
            initializeGlobalState(this);
            createUnitState(this);
            createLayerState(this);
            // Register listeners
            setupChangeListeners(this);
            return this;
        }
        return this._store;
    }

    /**
     * Return the instances of matrices created by the visual group.
     *
     * @return {Object} Instance of matrices.
     */
    matrixInstance (...matrices) {
        if (matrices.length) {
            return this;
        }
        return this.composition().matrices;
    }

    /**
     * Returns the composition of visual group.
     *
     * @public
     *
     * @return {Object} Composition of visual group. It contains instance of matrices {@link ValueMatrix}
     * and instances of axis.
     * ```
     *          {
     *              matrices: {
     *                  value: // Instance of center value matrix.
     *                  left: // Instance of left value matrix
     *                  right: // Instance of right value matrix
     *                  bottom: // Instance of bottom value matrix
     *                  top: // Instance of top value matrix.
     *              },
     *              axes: {
     *                  x: // Array of x axis.
     *                  y: // Array of y axis
     *                  color: // Array of color axis
     *                  shape: // Array of shape axis
     *                  size: // Array of size axis.
     *              }
     *          }
     * ```
     */
    composition (...params) {
        if (params.length) {
            return this;
        }
        return this._composition;
    }

    /**
     * Locks the model to prevent change listeners to be triggered until unlocked
     *
     * @return {Object} Instance of class VisualGroup
     * @memberof VisualGroup
     */
    lockModel () {
        this.store().model.lock();
        return this;
    }

    /**
     * Unlocks the model so that all change listeners can be triggered
     *
     * @return {Object} Instance of class VisualGroup
     */
    unlockModel () {
        this.store().model.unlock();
        return this;
    }

    /**
     * Returns the channel name of the variable. Channels are rows, columns, color, shape and size.
     *
     * @public
     * @param {string} variable Name of the variable.
     *
     * @return {string} Name of the channel.
     */
    where (variable) {
        return findInGroup(variable, this.resolver().getAllFields());
    }

    /**
     * Gets the axis instances of the visual group based on the given axis type.
     *
     * @public
     * @param {string} type Type of axis. X,Y or retinal axes.
     *
     * @return {Array} Array of axis instances.
     */
    getAxes (type) {
        if (type === RETINAL) {
            return this.resolver().getRetinalAxes();
        }
        return this.resolver().getSimpleAxes(type);
    }

    /**
     * Returns the instances of cells based on the given type. Type can be given as `row' or `col`.
     *
     * @public
     * @return {Array} Two dimensional array of cells.
     */
    getCells (type) {
        return this.resolver()[`${type}Cells`]();
    }

    getFieldsFromChannel (channel) {
        const {
            rowProjections,
            colProjections
        } = this.resolver().getAllFields();
        return channel === Y ? rowProjections : colProjections;
    }

    getCellsByFacetKey (facetKey) {
        const resolver = this.resolver();
        const cells = resolver.rowCells()[facetKey] || resolver.colCells()[facetKey] || [];
        return cells;
    }

    getAxesByFacetKey (axisType, facetKey) {
        const resolver = this.resolver();
        const cells = resolver.rowCells()[facetKey] || resolver.colCells()[facetKey];
        const axes = cells[0].valueOf().axes()[axisType] || [];

        return axes;
    }

    /**
     * This method is used to return a serialized representation of the instance's properties.
     *
     * @return {Object} Object with config proprties.
     * @memberof VisualGroup
     */
    serialize () {
        const store = this.store();

        return {
            [CONFIG]: store.get(CONFIG),
            [MOUNT]: store.get(MOUNT)
        };
    }

    /**
     * Returns the grouped datamodel prepared by visual group. If there is no group by performed, then it returns the
     * original data model passed to visual group.
     *
     * @return {DataModel} Grouped data model.
     */
    getGroupByData () {
        return this._groupedDataModel;
    }

    createMatrices () {
        createMatrices(this);
    }
}

export default VisualGroup;
