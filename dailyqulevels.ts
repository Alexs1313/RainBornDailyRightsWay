type QuizLevel = {
  title: string;
  questions: QuizQuestion[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

export const QUIZ_LEVELS: Record<number, QuizLevel> = {
  1: {
    title: 'LEVEL 1 - Advanced Celtic Folklore (Hard)',
    questions: [
      {
        question: 'The word "leprechaun" is derived from the Old Irish term:',
        options: ['Luchorpan', 'Lethbragan', 'Leithbroc'],
        correctIndex: 0,
      },
      {
        question: 'The term "luchorpan" literally means:',
        options: ['Small body', 'Hill spirit', 'Gold keeper'],
        correctIndex: 0,
      },
      {
        question:
          'In early Irish folklore, leprechauns were primarily known as:',
        options: ['Fairy shoemakers', 'Forest warriors', 'Sea spirits'],
        correctIndex: 0,
      },
      {
        question: 'Leprechauns belong to the supernatural group known as:',
        options: ['Aos Si', 'Fomorians', 'Fianna'],
        correctIndex: 0,
      },
      {
        question: 'In early legends, leprechauns were often described wearing:',
        options: ['Red clothing', 'Green clothing', 'Golden robes'],
        correctIndex: 0,
      },
      {
        question: 'In folklore, leprechauns usually dwell:',
        options: [
          'In castles',
          'In remote places or underground fairy mounds',
          'In busy towns',
        ],
        correctIndex: 1,
      },
      {
        question: 'The defining trait of a leprechaun is:',
        options: ['Physical strength', 'Cunning and trickery', 'Fire magic'],
        correctIndex: 1,
      },
      {
        question: 'If captured, a leprechaun must:',
        options: [
          'Grant one wish',
          'Reveal the location of hidden gold',
          'Give away his hat',
        ],
        correctIndex: 1,
      },
      {
        question: 'A leprechaun can escape if the captor:',
        options: [
          'Looks away even briefly',
          'Speaks his name',
          'Touches a rainbow',
        ],
        correctIndex: 0,
      },
      {
        question:
          'The Irish fairy hills associated with supernatural beings are called:',
        options: ['Fairy Mounds (Sidhe)', 'Stone Rings', 'Golden Barrows'],
        correctIndex: 0,
      },
    ],
  },
  2: {
    title: 'LEVEL 2 - Irish Myth and Culture',
    questions: [
      {
        question: 'Ireland is often called the:',
        options: ['Emerald Isle', 'Silver Land', 'Highland Isle'],
        correctIndex: 0,
      },
      {
        question: 'The national symbol of Ireland is the:',
        options: ['Harp', 'Eagle', 'Crown'],
        correctIndex: 0,
      },
      {
        question: 'The capital of Ireland is:',
        options: ['Cork', 'Dublin', 'Galway'],
        correctIndex: 1,
      },
      {
        question: 'The traditional Irish language is known as:',
        options: ['Gaelic (Gaeilge)', 'Celtic Latin', 'Old Nordic'],
        correctIndex: 0,
      },
      {
        question: 'A Celtic Cross is distinguished by:',
        options: [
          'A ring surrounding the intersection',
          'Two vertical lines',
          'No horizontal beam',
        ],
        correctIndex: 0,
      },
      {
        question: 'A traditional Irish dance style is:',
        options: ['Irish step dance', 'Waltz', 'Flamenco'],
        correctIndex: 0,
      },
      {
        question: 'The Tuatha De Danann are:',
        options: [
          'Mythical god-like beings in Irish mythology',
          'Viking tribes',
          'Medieval monks',
        ],
        correctIndex: 0,
      },
      {
        question: "St. Patrick's Day is celebrated on:",
        options: ['March 17', 'April 1', 'October 31'],
        correctIndex: 0,
      },
      {
        question: 'St. Patrick used the shamrock to explain:',
        options: ['Wealth', 'The Holy Trinity', 'The seasons'],
        correctIndex: 1,
      },
      {
        question: "The main color associated with St. Patrick's Day is:",
        options: ['Blue', 'Green', 'White'],
        correctIndex: 1,
      },
    ],
  },
  3: {
    title: 'LEVEL 3 - Symbols of Luck',
    questions: [
      {
        question: 'A four-leaf clover is considered a symbol of:',
        options: ['Strength', 'Luck', 'Power'],
        correctIndex: 1,
      },
      {
        question: 'The approximate rarity of a four-leaf clover is:',
        options: ['1 in 10', '1 in 100', '1 in 5000'],
        correctIndex: 2,
      },
      {
        question: 'A horseshoe traditionally symbolizes:',
        options: ['Protection and luck', 'Wealth', 'Victory'],
        correctIndex: 0,
      },
      {
        question: "In legend, a leprechaun's gold is kept in a:",
        options: ['Chest', 'Pot', 'Bag'],
        correctIndex: 1,
      },
      {
        question: 'The pot of gold is found:',
        options: ['In a cave', 'In a castle', 'At the end of a rainbow'],
        correctIndex: 2,
      },
      {
        question: 'A rainbow forms because of:',
        options: [
          'Magic',
          'Refraction of light in water droplets',
          'Clouds touching sunlight',
        ],
        correctIndex: 1,
      },
      {
        question: 'The color green in Irish culture symbolizes:',
        options: ['Fire', 'Nature and the land', 'Snow'],
        correctIndex: 1,
      },
      {
        question: 'A Celtic knot represents:',
        options: ['Eternity and interconnectedness', 'War', 'Authority'],
        correctIndex: 0,
      },
      {
        question: 'Gold in folklore often symbolizes:',
        options: ['Greed', 'Fortune and prosperity', 'Mystery'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns are known for:',
        options: [
          'Sharing their gold freely',
          'Hiding their gold and tricking humans',
          'Guarding royal treasures',
        ],
        correctIndex: 1,
      },
    ],
  },
  4: {
    title: 'LEVEL 4 - Leprechaun Legends and Pop Culture',
    questions: [
      {
        question: 'Leprechauns are typically described as being:',
        options: [
          'About knee-high to an adult',
          'Two meters tall',
          'Human-sized',
        ],
        correctIndex: 0,
      },
      {
        question: 'A traditional leprechaun accessory is:',
        options: ['A crown', 'A tall hat with a buckle', 'A sword'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns are most often portrayed as working as:',
        options: ['Blacksmiths', 'Shoemakers', 'Bakers'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns are usually depicted as:',
        options: [
          'Solitary beings',
          'Living in large families',
          'Leading armies',
        ],
        correctIndex: 0,
      },
      {
        question: "If someone takes a leprechaun's gold, it may:",
        options: [
          'Disappear once the leprechaun is gone',
          'Double in size',
          'Turn into silver',
        ],
        correctIndex: 0,
      },
      {
        question: 'In modern culture, the leprechaun mainly symbolizes:',
        options: ['Luck', 'War', 'Winter'],
        correctIndex: 0,
      },
      {
        question: 'In legend, the rainbow represents:',
        options: ['A doorway', 'A path to treasure', 'A warning sign'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns are commonly portrayed as:',
        options: ['Serious and silent', 'Cheerful but cunning', 'Emotionless'],
        correctIndex: 1,
      },
      {
        question: "A leprechaun's greatest defense is:",
        options: ['A spell', 'His cleverness', 'A magic staff'],
        correctIndex: 1,
      },
      {
        question:
          "The most recognized modern color of a leprechaun's outfit is:",
        options: ['Green', 'Black', 'Blue'],
        correctIndex: 0,
      },
    ],
  },
  5: {
    title: 'LEVEL 5 - Irish Nature & Landscapes',
    questions: [
      {
        question: 'Ireland is often called the "Emerald Isle" because of its:',
        options: ['Gold mines', 'Green landscapes', 'Tall mountains'],
        correctIndex: 1,
      },
      {
        question: 'A famous natural landmark in Ireland is:',
        options: ['Cliffs of Moher', 'Mount Everest', 'Grand Canyon'],
        correctIndex: 0,
      },
      {
        question: 'The River Liffey flows through which city?',
        options: ['Cork', 'Dublin', 'Belfast'],
        correctIndex: 1,
      },
      {
        question: 'Traditional Irish countryside is known for its:',
        options: ['Deserts', 'Rolling green hills', 'Tropical forests'],
        correctIndex: 1,
      },
      {
        question: 'Ancient stone circles in Ireland were likely used for:',
        options: ['Shopping', 'Ritual or ceremonial purposes', 'Farming tools'],
        correctIndex: 1,
      },
      {
        question: 'A common weather feature in Irish folklore is:',
        options: ['Sandstorms', 'Mist and fog', 'Tornadoes'],
        correctIndex: 1,
      },
      {
        question: 'Shamrocks grow naturally in:',
        options: ['Dry deserts', 'Grasslands and fields', 'Snow mountains'],
        correctIndex: 1,
      },
      {
        question: "The Giant's Causeway is famous for its:",
        options: ['Hexagonal stone columns', 'Waterfalls', 'Volcano'],
        correctIndex: 0,
      },
      {
        question: 'Ireland is part of which continent?',
        options: ['Asia', 'Europe', 'North America'],
        correctIndex: 1,
      },
      {
        question: 'Many Irish legends take place in:',
        options: ['Fairy hills and forests', 'Skyscrapers', 'Space stations'],
        correctIndex: 0,
      },
    ],
  },
  6: {
    title: 'LEVEL 6 - Leprechaun Tricks & Legends',
    questions: [
      {
        question: 'Leprechauns are best known for being:',
        options: ['Honest traders', 'Clever tricksters', 'Brave knights'],
        correctIndex: 1,
      },
      {
        question: 'If you keep your eyes on a leprechaun, he:',
        options: ['Must stay visible', 'Turns into gold', 'Falls asleep'],
        correctIndex: 0,
      },
      {
        question: 'Leprechauns usually guard:',
        options: ['Silver swords', 'Pots of gold', 'Magic books'],
        correctIndex: 1,
      },
      {
        question: 'In stories, leprechauns often make:',
        options: ['Loud music', 'Shoes', 'Crowns'],
        correctIndex: 1,
      },
      {
        question: 'If you blink while watching a leprechaun, he may:',
        options: ['Grow taller', 'Disappear', 'Freeze'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns are usually described as:',
        options: ['Tiny beings', 'Giants', 'Invisible shadows'],
        correctIndex: 0,
      },
      {
        question: 'Their gold is often hidden:',
        options: ['At the end of a rainbow', 'Under the sea', 'In castles'],
        correctIndex: 0,
      },
      {
        question: 'Leprechauns prefer to live:',
        options: ['Alone', 'In large cities', 'In royal courts'],
        correctIndex: 0,
      },
      {
        question: 'Catching a leprechaun usually brings:',
        options: [
          'Trouble or tricky bargains',
          'Instant fame',
          'Eternal power',
        ],
        correctIndex: 0,
      },
      {
        question: 'The main reason leprechauns avoid humans is:',
        options: [
          'Fear of sunlight',
          'To protect their treasure',
          'They dislike music',
        ],
        correctIndex: 1,
      },
    ],
  },
  7: {
    title: 'LEVEL 7 - Irish Traditions & Festivities',
    questions: [
      {
        question: "St. Patrick's Day is celebrated in:",
        options: ['February', 'March', 'December'],
        correctIndex: 1,
      },
      {
        question: "Wearing green on St. Patrick's Day is meant to:",
        options: [
          'Blend with nature',
          'Celebrate Irish heritage',
          'Show wealth',
        ],
        correctIndex: 1,
      },
      {
        question: 'A traditional Irish musical instrument is the:',
        options: ['Harp', 'Trumpet', 'Piano'],
        correctIndex: 0,
      },
      {
        question: 'Irish step dancing is known for:',
        options: [
          'Large arm movements',
          'Fast footwork with still upper body',
          'Slow spinning',
        ],
        correctIndex: 1,
      },
      {
        question: "A common St. Patrick's Day tradition is:",
        options: ['Fireworks at midnight', 'Parades', 'Snow festivals'],
        correctIndex: 1,
      },
      {
        question: 'The shamrock is most closely associated with:',
        options: ['Ireland', 'Spain', 'Greece'],
        correctIndex: 0,
      },
      {
        question: 'Traditional Irish folklore includes stories about:',
        options: ['Robots', 'Fairies and spirits', 'Space travelers'],
        correctIndex: 1,
      },
      {
        question: 'Green is associated with Ireland partly because of its:',
        options: ['Forest myths', 'Lush green fields', 'National flag only'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns became popular worldwide mainly through:',
        options: [
          'Irish folklore and celebrations',
          'Ancient Roman texts',
          'Viking sagas',
        ],
        correctIndex: 0,
      },
      {
        question:
          'Modern depictions of leprechauns usually show them as symbols of:',
        options: ['Luck and fortune', 'War', 'Winter'],
        correctIndex: 0,
      },
    ],
  },
  8: {
    title: 'LEVEL 8 - Celtic Symbols & Meanings',
    questions: [
      {
        question: 'The Celtic knot is best known for symbolizing:',
        options: ['Wealth', 'Eternity and interconnectedness', 'Victory'],
        correctIndex: 1,
      },
      {
        question: 'The triskelion (three spirals) represents:',
        options: ['Movement and cycles', 'War', 'Silence'],
        correctIndex: 0,
      },
      {
        question: 'The shamrock traditionally has how many leaves?',
        options: ['Three', 'Four', 'Five'],
        correctIndex: 0,
      },
      {
        question: 'A four-leaf clover is different from a shamrock because it:',
        options: [
          'Is a religious symbol',
          'Is a rare variation symbolizing luck',
          'Grows only in Ireland',
        ],
        correctIndex: 1,
      },
      {
        question: 'The harp appears on:',
        options: [
          "Ireland's official emblem",
          'The Irish flag only',
          'Irish coins only',
        ],
        correctIndex: 0,
      },
      {
        question: 'The Celtic Cross includes a circle to symbolize:',
        options: ['The sun or eternity', 'Gold', 'A shield'],
        correctIndex: 0,
      },
      {
        question: 'Green is strongly associated with Ireland because of its:',
        options: ['Emerald mines', 'Lush natural landscape', 'National animal'],
        correctIndex: 1,
      },
      {
        question: 'In folklore, gold often represents:',
        options: ['Hard work', 'Fortune and reward', 'Magic spells'],
        correctIndex: 1,
      },
      {
        question: 'A rainbow traditionally symbolizes:',
        options: ['Danger', 'A bridge or path to treasure', 'Storms'],
        correctIndex: 1,
      },
      {
        question: 'Celtic patterns are often continuous to show:',
        options: ['Strength', 'Endless life and unity', 'Authority'],
        correctIndex: 1,
      },
    ],
  },
  9: {
    title: 'LEVEL 9 - Luck & Beliefs',
    questions: [
      {
        question: 'Finding a four-leaf clover is believed to bring:',
        options: ['Strength', 'Luck', 'Fame'],
        correctIndex: 1,
      },
      {
        question: 'Hanging a horseshoe above a door is meant to:',
        options: [
          'Decorate the house',
          'Bring protection and luck',
          'Keep animals away',
        ],
        correctIndex: 1,
      },
      {
        question: 'In many legends, luck is something that must be:',
        options: ['Bought', 'Earned or discovered', 'Borrowed'],
        correctIndex: 1,
      },
      {
        question:
          'Leprechauns are protective of their gold because it represents:',
        options: ['Their magic', 'Their fortune and identity', 'Their family'],
        correctIndex: 1,
      },
      {
        question: 'A rainbow appears when sunlight:',
        options: [
          'Reflects off mountains',
          'Passes through rain droplets',
          'Hits the ocean',
        ],
        correctIndex: 1,
      },
      {
        question:
          'Irish folklore teaches that cleverness is often more powerful than:',
        options: ['Speed', 'Strength', 'Size'],
        correctIndex: 1,
      },
      {
        question: 'The idea of "the end of the rainbow" mainly represents:',
        options: ['A real place', 'A magical destination', 'A mountain'],
        correctIndex: 1,
      },
      {
        question: 'Many Irish legends were traditionally passed down through:',
        options: ['Books only', 'Oral storytelling', 'Paintings'],
        correctIndex: 1,
      },
      {
        question: 'The color gold in legends often symbolizes:',
        options: ['Greed', 'Prosperity and success', 'Anger'],
        correctIndex: 1,
      },
      {
        question: 'Luck in folklore is often described as something that:',
        options: ['Changes quickly', 'Lasts forever', 'Never disappears'],
        correctIndex: 0,
      },
    ],
  },
  10: {
    title: 'LEVEL 10 - The Final Treasure (Easiest & Fun)',
    questions: [
      {
        question:
          'Leprechauns are most commonly associated with which country?',
        options: ['Ireland', 'Scotland', 'Norway'],
        correctIndex: 0,
      },
      {
        question: 'The most famous leprechaun treasure is:',
        options: ['A magic sword', 'A pot of gold', 'A crystal crown'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns are usually described as being:',
        options: ['Very tall', 'Very small', 'Invisible'],
        correctIndex: 1,
      },
      {
        question: "The traditional color of a leprechaun's outfit today is:",
        options: ['Green', 'Purple', 'Silver'],
        correctIndex: 0,
      },
      {
        question: "St. Patrick's Day is celebrated on:",
        options: ['March 17', 'April 17', 'May 1'],
        correctIndex: 0,
      },
      {
        question: 'A shamrock usually has:',
        options: ['Three leaves', 'Four leaves', 'Two leaves'],
        correctIndex: 0,
      },
      {
        question: 'A rainbow is made of how many main colors?',
        options: ['Five', 'Seven', 'Nine'],
        correctIndex: 1,
      },
      {
        question: 'Leprechauns are known for being:',
        options: ['Serious warriors', 'Clever tricksters', 'Silent giants'],
        correctIndex: 1,
      },
      {
        question: "The Emerald Isle refers to Ireland's:",
        options: ['Wealth', 'Green landscape', 'Mountains'],
        correctIndex: 1,
      },
      {
        question: 'In legend, the treasure is found at:',
        options: [
          'The top of a hill',
          'The end of a rainbow',
          'The bottom of the sea',
        ],
        correctIndex: 1,
      },
    ],
  },
};
