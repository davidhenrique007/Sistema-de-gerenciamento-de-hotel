// ============================================
// DTO: RoomDetailsDTO
// ============================================
// Responsabilidade: Transformar entidade Room em dados para UI
// Aplica SRP: Responsável APENAS pela transformação de dados
// ============================================

// ============================================
// CONFIGURAÇÕES (poderiam vir de um arquivo de configuração)
// ============================================

const ROOM_TYPE_LABELS = {
  standard: 'Standard',
  deluxe: 'Deluxe',
  executive: 'Executivo',
  family: 'Família',
  presidential: 'Presidencial'
};

const AMENITY_ICON_MAP = {
  'wi-fi': 'wifi',
  'tv': 'tv',
  'ar condicionado': 'air-conditioner',
  'frigobar': 'fridge',
  'cafeteira': 'coffee',
  'secador': 'hair-dryer',
  'cofre': 'safe',
  'varanda': 'balcony',
  'vista mar': 'ocean-view'
};

const ROOM_DESCRIPTIONS = {
  standard: 'Conforto e praticidade para sua estadia. Quarto aconchegante com tudo que você precisa para relaxar após um dia de trabalho ou lazer.',
  deluxe: 'Mais espaço e conforto para momentos especiais. Nossos quartos Deluxe oferecem uma experiência superior com acabamentos refinados.',
  executive: 'Ideal para viajantes a negócios, com área de trabalho dedicada e amenities exclusivas para máxima produtividade e conforto.',
  family: 'Espaço pensado para famílias, com áreas integradas e estrutura completa para adultos e crianças aproveitarem juntos.',
  presidential: 'O ápice do luxo e sofisticação. Suíte presidencial com sala de estar, jantar e quarto separados, além de amenities exclusivas.'
};

const ROOM_FEATURES = {
  standard: [
    'Cama box casal',
    'TV LED 40"',
    'Wi-Fi de alta velocidade',
    'Banheiro privativo',
    'Vista interna',
    'Chuveiro elétrico'
  ],
  deluxe: [
    'Cama box casal',
    'TV LED 40"',
    'Wi-Fi de alta velocidade',
    'Banheiro privativo',
    'Vista para o mar',
    'Banheira de hidromassagem',
    'Frigobar abastecido'
  ],
  executive: [
    'Cama box casal',
    'TV LED 40"',
    'Wi-Fi de alta velocidade',
    'Banheiro privativo',
    'Mesa de trabalho ampla',
    'Máquina de café expresso',
    'Vista panorâmica',
    'Acesso ao lounge executivo'
  ],
  family: [
    'Cama box casal',
    'TV LED 40"',
    'Wi-Fi de alta velocidade',
    'Banheiro privativo',
    'Cama extra',
    'Berço disponível',
    'Espaço kids',
    '2 TVs',
    'Jogos de tabuleiro'
  ],
  presidential: [
    'Cama box casal',
    'TV LED 40"',
    'Wi-Fi de alta velocidade',
    'Banheiro privativo',
    'Sala de estar separada',
    'Sala de jantar',
    '2 suítes',
    'Cozinha equipada',
    'Jacuzzi',
    'Serviço de mordomo',
    'Vista 360°'
  ]
};

// ============================================
// DTO PRINCIPAL
// ============================================

export class RoomDetailsDTO {
  constructor(data) {
    this.id = data.id;
    this.number = data.number;
    this.type = data.type;
    this.typeLabel = data.typeLabel;
    this.capacity = data.capacity;
    this.capacityLabel = data.capacityLabel;
    this.pricePerNight = data.pricePerNight;
    this.pricePerNightFormatted = data.pricePerNightFormatted;
    this.status = data.status;
    this.statusLabel = data.statusLabel;
    this.statusColor = data.statusColor;
    this.statusSeverity = data.statusSeverity;
    this.images = data.images;
    this.mainImage = data.mainImage;
    this.amenities = data.amenities;
    this.available = data.available;
    this.availableForReservation = data.availableForReservation;
    this.description = data.description;
    this.features = data.features;
  }

  /**
   * Factory method: Cria DTO a partir da entidade Room
   * @param {Room} room - Entidade Room
   * @returns {RoomDetailsDTO} DTO populado
   */
  static fromDomain(room) {
    const type = room.type.toLowerCase();
    
    return new RoomDetailsDTO({
      id: room.id,
      number: room.number,
      type: room.type,
      typeLabel: this._getTypeLabel(room.type),
      capacity: room.capacity,
      capacityLabel: this._getCapacityLabel(room.capacity),
      pricePerNight: room.pricePerNight.amount,
      pricePerNightFormatted: room.pricePerNight.toString(),
      status: room.status.value,
      statusLabel: room.status.label,
      statusColor: room.status.color,
      statusSeverity: room.status.severity,
      images: this._getRoomImages(room.type),
      mainImage: `/assets/images/rooms/${room.type}/main.jpg`,
      amenities: this._formatAmenities(room.amenities),
      available: room.isAvailable(),
      availableForReservation: room.status.allowsReservation,
      description: this._getRoomDescription(type),
      features: this._getRoomFeatures(type)
    });
  }

  /**
   * Retorna label amigável para o tipo de quarto
   * @private
   */
  static _getTypeLabel(type) {
    return ROOM_TYPE_LABELS[type.toLowerCase()] || type;
  }

  /**
   * Retorna label de capacidade
   * @private
   */
  static _getCapacityLabel(capacity) {
    return `${capacity} ${capacity === 1 ? 'hóspede' : 'hóspedes'}`;
  }

  /**
   * Retorna lista de imagens do quarto
   * @private
   */
  static _getRoomImages(type) {
    const basePath = `/assets/images/rooms/${type}`;
    return [
      { id: 'main', url: `${basePath}/main.jpg`, alt: `Quarto ${type} - Principal` },
      { id: '1', url: `${basePath}/1.jpg`, alt: `Quarto ${type} - Vista 1` },
      { id: '2', url: `${basePath}/2.jpg`, alt: `Quarto ${type} - Vista 2` },
      { id: '3', url: `${basePath}/3.jpg`, alt: `Quarto ${type} - Vista 3` }
    ];
  }

  /**
   * Formata amenities com ícones
   * @private
   */
  static _formatAmenities(amenities) {
    return amenities.map(amenity => ({
      name: amenity,
      icon: this._getAmenityIcon(amenity)
    }));
  }

  /**
   * Retorna ícone para amenidade
   * @private
   */
  static _getAmenityIcon(amenity) {
    const amenityLower = amenity.toLowerCase();
    
    for (const [key, icon] of Object.entries(AMENITY_ICON_MAP)) {
      if (amenityLower.includes(key)) {
        return icon;
      }
    }

    return 'check'; // ícone padrão
  }

  /**
   * Retorna descrição do quarto baseada no tipo
   * @private
   */
  static _getRoomDescription(type) {
    return ROOM_DESCRIPTIONS[type] || 'Quarto confortável e bem equipado.';
  }

  /**
   * Retorna características do quarto
   * @private
   */
  static _getRoomFeatures(type) {
    return ROOM_FEATURES[type] || ROOM_FEATURES.standard;
  }

  toJSON() {
    return {
      id: this.id,
      number: this.number,
      type: this.type,
      typeLabel: this.typeLabel,
      capacity: this.capacity,
      capacityLabel: this.capacityLabel,
      pricePerNight: this.pricePerNight,
      pricePerNightFormatted: this.pricePerNightFormatted,
      status: this.status,
      statusLabel: this.statusLabel,
      statusColor: this.statusColor,
      statusSeverity: this.statusSeverity,
      images: this.images,
      mainImage: this.mainImage,
      amenities: this.amenities,
      available: this.available,
      availableForReservation: this.availableForReservation,
      description: this.description,
      features: this.features
    };
  }
}