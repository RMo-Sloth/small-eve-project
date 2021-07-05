export class Faction {
  public name !: 'Minmatar' | 'Amarr' | 'Caldari' | 'Gallente';
  public color !: string;
  public enabled: boolean = true;

  constructor() {}
}

export class MinmatarFaction extends Faction {
  public color = '#653834';

  constructor() {
    super();
    this.name = 'Minmatar';
  }
}

export class CaldariFaction extends Faction {
  public color = '#4a6c7f';

  constructor() {
    super();
    this.name = 'Caldari';
  }
}

export class AmarrFaction extends Faction {
  public color = '#7f6c50';

  constructor() {
    super();
    this.name = 'Amarr';
  }
}

export class GallenteFaction extends Faction {
  public color = '#366565';

  constructor() {
    super();
    this.name = 'Gallente';
  }
}
