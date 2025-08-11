const SEAT_NUMBER_REGEX: RegExp = /(\d+)([A-Z])/;

function buildDeck(deck: any, facilityDisplayOption: SeatmapFacilitiesDisplayOption): SeatmapCompartment[] {
  const compartments: SeatmapCompartment[] = [];
  if (deck && deck.deckConfiguration) {
    // Init compartment
    const compartment = new SeatmapCompartment(deck.deckConfiguration.width!, deck.deckConfiguration.length!);

    deck.seats = deck.seats.map((seat: any) => {
      return {
        ...seat, // Spread existing seat properties  deck.carrierCode
        flightNumber: deck.flightNumber, // Add or update flightNumber property
      };
    });

    // Add seats
    addSeats(compartment, deck.seats);

    if (facilityDisplayOption === SeatmapFacilitiesDisplayOption.SHOW_FACILITIES) {
      // Add facilities
      addFacilities(compartment, deck.facilities);

      // Group facilities
      groupFacilities(compartment);
    }

    // Add wings
    // addWings(compartment, deck.deckConfiguration.startWingsX, deck.deckConfiguration.endWingsX);

    // Mark exit rows
    markExitRows(compartment, deck.deckConfiguration.exitRowsX);

    if (!!deck.seats) {
      const indexes = extractIndexes(compartment);

      // const indexes = computeDisplayableCoordinates(deck.seats);

      // Add column indexes on first line
      addColumnIndexes(compartment, indexes.columns);

      // Add row indexes in alleys
      addRowIndexes(compartment, indexes.rows, indexes.alleys);
    }
    compartments.push(compartment);
  }
  return compartments;
}

function extractIndexes(compartment: SeatmapCompartment) {
  // stores an association vertical axis + row number
  const rowIndexes: any = {};
  // store an association horizontal axis + column name
  const columnsIndexes: any = {};
  compartment.rows.forEach((row) => {
    row.cells.forEach((cell) => {
      if (isSeat(cell)) {
        const seat = cell.seat;
        if (!isValidSeatmapCoordinates(seat.coordinates) || !seat.number) {
          return;
        }
        const seatX = seat.coordinates.x!;
        const seatY = seat.coordinates.y!;
        // if we already processed both coordinates, no need to go through them again
        if (rowIndexes[seatX] && columnsIndexes[seatY]) {
          return;
        }
        const values = parseSeatNumber(seat);
        if (values) {
          rowIndexes[seatX] = values.rowNumber;
          columnsIndexes[seatY] = values.columnName;
        }
      }
    });
  });

  const alleys = computeAlleys(Object.keys(columnsIndexes).map((value) => +value));

  return {
    columns: Object.keys(columnsIndexes).map((y) => ({ name: columnsIndexes[+y], y: +y })),
    rows: Object.keys(rowIndexes).map((x) => ({ name: rowIndexes[+x], x: +x + 1 })),
    alleys: alleys,
  };
}

/**
 * Adds row indexes in alleys of the compartment
 * @param compartment the compartment to add row indexes
 * @param rows the rows indexes to add in the compartment
 * @param alleys the array of alleys
 */
function addRowIndexes(compartment: SeatmapCompartment, rows: { name: string; x: number }[], alleys: number[]) {
  alleys.forEach((alley) => {
    rows.forEach((row) => {
      const rowEntity = new SeatmapBaseEntity(SeatmapEntityType.ROW_INDEX);
      rowEntity.index = row.name;
      compartment.rows[row.x].cells[alley] = rowEntity;
    });
  });
}

/**
 * Adds column indexes in the first row of the compartment
 * @param compartment the compartment to add column indexes
 * @param columns the columns indexes to add in the compartment
 */
function addColumnIndexes(compartment: SeatmapCompartment, columns: { name: string; y: number }[]) {
  columns.forEach((column) => {
    const columnEntity = new SeatmapBaseEntity(SeatmapEntityType.COL_INDEX);
    columnEntity.index = column.name;
    compartment.rows[0]?.addEntity(column.y, columnEntity);
  });
}

/**
 * Adds facilities in the compartment if any
 * @param compartment the compartment to add facilities
 * @param facilities the facilities to add in the compartment
 */
function addFacilities(compartment: SeatmapCompartment, facilities: any[] | undefined) {
  if (!facilities) {
    return;
  }

  facilities.forEach((facility) => {
    const entity: FacilityEntity = new FacilityEntity(facility);

    if (facility.coordinates) {
      compartment.addEntity(facility.coordinates, entity);
    }
  });
}

/**
 * Adds seats in the compartment if any
 * @param compartment the compartment to add seats
 * @param seats the seats to add in the compartment
 */
function addSeats(compartment: SeatmapCompartment, seats: any[] | undefined) {
  if (!seats) {
    return;
  }

  seats.forEach((seat, index) => {
    const entity: SeatEntity = new SeatEntity(seat);

    // Mark the seat with extra legroom if needed characteristicsCodes
    if (seat.characteristicsCodes && seat.characteristicsCodes.indexOf('L') !== -1) {
      entity.isExtraLeg = true;
    }

    if (seat.coordinates) {
      compartment.addEntity(seat.coordinates, entity);
    }
  });
}

/**
 * Adds wings in the compartment if any
 * @param compartment the compartment to add wings
 * @param startWingsX the starting index for the wings
 * @param endWingsX  the ending index for the wings
 */
function addWings(compartment: SeatmapCompartment, startWingsX?: number, endWingsX?: number) {
  if (startWingsX && endWingsX) {
    for (let x = startWingsX; x <= endWingsX; ++x) {
      let leftWing = WingPosition.LEFT;
      let rightWing = WingPosition.RIGHT;

      switch (x) {
        case startWingsX:
          leftWing = WingPosition.LEFT_START;
          rightWing = WingPosition.RIGHT_START;
          break;
        case endWingsX:
          leftWing = WingPosition.LEFT_END;
          rightWing = WingPosition.RIGHT_END;
          break;
      }

      compartment.addEntity({ x: x, y: 0 }, new WingEntity(leftWing));
      compartment.addEntity({ x: x, y: compartment.rows[x].cells.length - 1 }, new WingEntity(rightWing));
    }
  }
}

/**
 * Marks exit rows in the compartment if any
 * @param compartment the compartment to mark exit rows
 * @param exitRowsX the indexes of exit rows
 */
function markExitRows(compartment: SeatmapCompartment, exitRowsX: number[] | undefined) {
  if (exitRowsX && exitRowsX.length > 0) {
    exitRowsX.forEach((exitRowIndex) => {
      compartment.markExitRow(exitRowIndex);
    });
  }
}

/**
 * Iterates through rows in the given compartment and groups the facilities
 * @param compartment the compartment to group facilities
 */
function groupFacilities(compartment: SeatmapCompartment) {
  // Start at index 1, because first line (index 0) contains column names
  for (let rowIndex = 1; rowIndex < compartment.rows.length; ++rowIndex) {
    groupRowFacilities(compartment.rows[rowIndex]);
  }
}

/**
 * Navigate through the row to find consecutive facilities with same code
 * @param row the row to group facilities
 */
function groupRowFacilities(row: SeatmapRow) {
  let masterFacility: any = null;
  for (let colIndex = 0; colIndex < row.cells.length; ++colIndex) {
    const currentCell = row.cells[colIndex];

    if (isFacility(currentCell)) {
      // The current cell is a facility...

      if (masterFacility !== null && masterFacility.facility.code === currentCell.facility.code) {
        // ...and the previously saved facility has the same code
        // Increase the colspan of the previously saved facility and transform the current one to be a grouped facility
        masterFacility.colspan!++;
        row.cells[colIndex] = new SeatmapBaseEntity(SeatmapEntityType.GROUPED_FACILITY);
      } else {
        // ...and no previously saved facility or codes are different, save this one
        masterFacility = currentCell;
      }
    } else {
      // Current cell is not a facility so discarding the previously saved facility
      masterFacility = null;
    }
  }
}

function computeDisplayableCoordinates(seats: any) {
  // stores an association vertical axis + row number
  var rowsCoordinates: any = {};
  // store an association horizontal axis + column name
  var columnsCoordinates: any = {};
  seats.forEach((seat: any) => {
    if (!isValidSeatmapCoordinates(seat.coordinates) || !seat.number) {
      return;
    }
    var seatX = seat.coordinates.x;
    var seatY = seat.coordinates.y;
    var values = parseSeatNumber(seat);
    if (values) {
      if (rowsCoordinates[seatX] && columnsCoordinates[seatY]) {
        if (columnsCoordinates[seatY] !== seatY) {
          console.log('Somethings wrong here... %s !== %s', columnsCoordinates[seatY], seatY);
        }
        return;
      }

      rowsCoordinates[seatX] = values.rowNumber;
      columnsCoordinates[seatY] = values.columnName;
    }

    // if we already processed both coordinates, no need to go through them again
  });
  var alleys = computeAlleys(
    Object.keys(columnsCoordinates).map(function (value) {
      return +value;
    })
  );
  return {
    columns: Object.keys(columnsCoordinates).map(function (y) {
      return { name: columnsCoordinates[+y], y: +y };
    }),
    rows: Object.keys(rowsCoordinates).map(function (x) {
      return { name: rowsCoordinates[+x], x: +x };
    }),
    alleys: alleys,
  };
}

/**
 * Returns true if passed SeatmapCoordinates is valid.
 * That is: not null and with defined X and Y positions.
 * @param {SeatmapCoordinates} coordinates
 * @returns {boolean}
 */
function isValidSeatmapCoordinates(coordinates: any) {
  return !!coordinates && coordinates.x !== undefined && coordinates.y !== undefined;
}

/**
 * Provided an array of number, looks for free space in between two values.
 * Example: [1, 2, 4, 5] would return [3].
 * Used to compute the place of alleys in a seatmap since the information is not returned.
 * @param coordinates
 */
function computeAlleys(coordinates: any) {
  return coordinates.reduce(function (alleys: any, current: any, index: any) {
    if (index === 0) {
      return alleys;
    }
    var difference = current - coordinates[index - 1];
    if (difference > 1) {
      alleys.push(current - difference / 2);
    }
    return alleys;
  }, []);
}

/**
 * Parse the seatnumber of a seat and return the column and row as separate values.
 * @param seat
 */
function parseSeatNumber(seat: any) {
  let parsed = SEAT_NUMBER_REGEX.exec((seat.number || '').toUpperCase());
  if (parsed) {
    return {
      rowNumber: parsed[1],
      columnName: parsed[2],
    };
  }
}

const enum SeatmapFacilitiesDisplayOption {
  SHOW_FACILITIES,
  HIDE_FACILITIES,
}

const enum SeatmapEntityType {
  EMPTY = 'empty',
  SEAT = 'seat',
  FACILITY = 'facility',
  GROUPED_FACILITY = 'groupedFacility',
  WALL = 'wall',
  WING = 'wing',
  ROW_INDEX = 'rowIndex',
  COL_INDEX = 'columnIndex',
}

const enum WingPosition {
  LEFT,
  LEFT_START,
  LEFT_END,
  RIGHT,
  RIGHT_START,
  RIGHT_END,
}

class SeatmapCompartment {
  // Constant for the number of extra columns to add for walls
  private static readonly NB_EXTRA_COLS = 2;
  // Constant for the number of extra rows to add for column names
  private static readonly NB_EXTRA_ROWS = 1;

  public rows: SeatmapRow[] = [];

  constructor(width: number, length: number) {
    for (let i = 0; i < length + SeatmapCompartment.NB_EXTRA_ROWS; ++i) {
      this.rows[i] = new SeatmapRow(width);
    }
  }

  public addEntity(coordinates: any, entity: SeatmapBaseEntity) {
    if (isValidSeatmapCoordinates(coordinates)) {
      this.rows[coordinates.x + 1!].addEntity(coordinates.y!, entity);
    }
  }

  public markExitRow(index: number) {
    if (index >= 0 && index < this.rows.length) {
      this.rows[index].hasExitDoors = true;
    }
  }
}

class SeatmapRow {
  public cells: SeatmapBaseEntity[] = [];
  public hasExtraLegSeats?: boolean;
  public hasExitDoors?: boolean;

  constructor(width: number) {
    for (let j = 0; j < width; ++j) {
      let type: SeatmapEntityType;
      switch (j) {
        case 0:
        case width - 1:
          type = SeatmapEntityType.WALL;
          break;
        default:
          type = SeatmapEntityType.EMPTY;
          break;
      }
      this.cells[j] = new SeatmapBaseEntity(type);
    }
  }

  public addEntity(index: number, entity: SeatmapBaseEntity) {
    if (index >= 0 && index < this.cells.length) {
      this.cells[index] = entity;

      if (isSeat(entity) && entity.isExtraLeg) {
        this.hasExtraLegSeats = true;
      }
    }
  }
}

class SeatmapBaseEntity {
  public type: SeatmapEntityType;
  public index?: string;

  constructor(type: SeatmapEntityType) {
    this.type = type;
  }
}

class SeatEntity extends SeatmapBaseEntity {
  public seat: any;
  public isExtraLeg?: boolean;

  constructor(seat: any) {
    super(SeatmapEntityType.SEAT);
    this.seat = seat;
  }
}

class FacilityEntity extends SeatmapBaseEntity {
  public facility: any;
  public colspan: number;

  constructor(facility: any) {
    super(SeatmapEntityType.FACILITY);
    this.facility = facility;
    this.colspan = 1;
  }
}

class WingEntity extends SeatmapBaseEntity {
  public position: WingPosition;

  constructor(position: WingPosition) {
    super(SeatmapEntityType.WING);
    this.position = position;
  }
}

function isSeat(entity: SeatmapBaseEntity): entity is SeatEntity {
  return entity.type === SeatmapEntityType.SEAT;
}

function isFacility(entity: SeatmapBaseEntity): entity is FacilityEntity {
  return entity.type === SeatmapEntityType.FACILITY;
}

function isWing(entity: SeatmapBaseEntity): entity is WingEntity {
  return entity.type === SeatmapEntityType.WING;
}

export { buildDeck, SeatmapFacilitiesDisplayOption };
