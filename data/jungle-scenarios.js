// One canonical state per scenario.
window.PGH_JUNGLE = [
  {
    "type": "gank window",
    "time": "3:15",
    "you": "Lee Sin",
    "hp": "90%",
    "ult": "NÃO",
    "top": "aliado 70% vs inimigo 45% sem flash, wave congelada no seu lado",
    "mid": "empurrado contra você",
    "bot": "sem prioridade",
    "obj": "Aronguejo top em 10s",
    "ej": "começou bot, pathing pra cima",
    "opts": [
      [
        "GANK TOP",
        "G"
      ],
      [
        "PEGAR ARONGUEJO TOP",
        "O"
      ],
      [
        "GANK MID",
        "R"
      ],
      [
        "INVADIR BOT SIDE",
        "I"
      ]
    ],
    "exp": "Top sem flash + wave congelada = gank de graça. Aronguejo é plano B seguro.",
    "id": "jg-01",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Garen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Darius",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Orianna",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Syndra",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Jinx",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Thresh",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Nautilus",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Lee Sin",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_FREEZE"
        },
        "mid": {
          "waveState": "RED_PUSHING"
        },
        "bot": {
          "waveState": "RED_PUSHING"
        }
      },
      "objectives": {
        "scuttleTop": {
          "state": "SPAWNING",
          "seconds": 10
        }
      },
      "structures": {}
    }
  },
  {
    "type": "countergank",
    "time": "4:40",
    "you": "Jarvan IV",
    "hp": "85%",
    "ult": "NÃO",
    "top": "seu top 50% com wave empurrando pra torre inimiga",
    "mid": "neutro",
    "bot": "sua bot com prioridade",
    "obj": "nada up",
    "ej": "apareceu na ward top-side 5s atrás, full HP",
    "opts": [
      [
        "COUNTERGANK TOP",
        "G"
      ],
      [
        "GANK MID",
        "O"
      ],
      [
        "FARMAR BOT SIDE",
        "R"
      ],
      [
        "DIVE TOP COM SEU TOP",
        "I"
      ]
    ],
    "exp": "Jungler inimigo vai gankar top. Chegar junto vira 2v2 vencível com seu CC.",
    "id": "jg-02",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Malphite",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Ahri",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Kai'Sa",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Leona",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Ashe",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Braum",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Jarvan IV",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "redTopJungle",
            "secondsAgo": 5
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_PUSHING"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "objective trade",
    "time": "8:10",
    "you": "Vi",
    "hp": "80%",
    "ult": "READY",
    "top": "aliado 40% vs inimigo 20% sem flash, wave indo pro aliado",
    "mid": "sua mid com prioridade",
    "bot": "sua bot tem prioridade",
    "obj": "Dragon 1:20 · arauto UP",
    "ej": "visto bot há 6s",
    "opts": [
      [
        "START ARAUTO",
        "G"
      ],
      [
        "GANK TOP",
        "O"
      ],
      [
        "FORCE BOT DIVE",
        "R"
      ],
      [
        "RESET AGORA",
        "I"
      ]
    ],
    "exp": "Jungler visto bot + prioridade mid = janela para arauto. Top pode esperar; confirme visão antes de começar.",
    "id": "jg-03",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Ornn",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Draven",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Alistar",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Sivir",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Morgana",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Vi",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "botRiver",
            "secondsAgo": 6
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_FREEZE"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "BLUE_PUSHING"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 80
        },
        "herald": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "bad dive",
    "time": "6:30",
    "you": "Elise",
    "hp": "55%",
    "ult": "READY",
    "top": "inimigo 80% full HP com flash, seu top 30%",
    "mid": "inimigo sumido (SS)",
    "bot": "neutro",
    "obj": "nenhum",
    "ej": "sem info há 1min",
    "opts": [
      [
        "RESET + FARMAR",
        "G"
      ],
      [
        "WARDAR TOP SIDE",
        "O"
      ],
      [
        "DIVE TOP",
        "I"
      ],
      [
        "INVADIR SEM INFO",
        "R"
      ]
    ],
    "exp": "Dive em full HP com flash e mid sumido é pedido de double kill inimigo. Reset e jogue pelo mapa.",
    "id": "jg-04",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Nasus",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Renekton",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Kassadin",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "LeBlanc",
          "role": "MID",
          "team": "red",
          "homeLane": "mid",
          "state": "MISSING"
        },
        "blue-adc": {
          "champion": "Vayne",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Lulu",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Xayah",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Janna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Elise",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "reset timing",
    "time": "5:00",
    "you": "Graves",
    "hp": "35%",
    "ult": "NÃO",
    "top": "empurrando contra você",
    "mid": "sua mid com prioridade",
    "bot": "neutro",
    "obj": "Aronguejo bot em 20s",
    "ej": "full HP, visto mid",
    "opts": [
      [
        "RESET AGORA",
        "G"
      ],
      [
        "PEGAR ARONGUEJO BOT LOW",
        "I"
      ],
      [
        "GANK MID LOW",
        "R"
      ],
      [
        "FARMAR ATÉ MORRER",
        "I"
      ]
    ],
    "exp": "35% HP antes de aronguejo = reset. Você volta full com item e contesta no tempo.",
    "id": "jg-05",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Jayce",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Yasuo",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Talon",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Nami",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Soraka",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Graves",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "midRiver"
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_PUSHING"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "scuttleBot": {
          "state": "SPAWNING",
          "seconds": 20
        }
      },
      "structures": {}
    }
  },
  {
    "type": "tempo",
    "time": "7:20",
    "you": "Nidalee",
    "hp": "95%",
    "ult": "READY",
    "top": "neutro",
    "mid": "sua mid puxou e vai roam",
    "bot": "inimigos estendidos sem visão",
    "obj": "Dragon 0:40",
    "ej": "morto há 10s",
    "opts": [
      [
        "GANK BOT",
        "G"
      ],
      [
        "SETUP DRAGON",
        "O"
      ],
      [
        "INVADIR JUNGLER MORTO",
        "O"
      ],
      [
        "RESET",
        "R"
      ]
    ],
    "exp": "Jungler morto + bot estendido = punição grátis. Dragon é sequência natural depois.",
    "id": "jg-06",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Twisted Fate",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid",
          "state": "ROAMING",
          "currentPosition": "botRiver"
        },
        "red-mid": {
          "champion": "Zoe",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Yuumi",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Senna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Nidalee",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "DEAD"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "RED_PUSHING"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 40
        }
      },
      "structures": {}
    }
  },
  {
    "type": "vision",
    "time": "9:00",
    "you": "Sejuani",
    "hp": "75%",
    "ult": "READY",
    "top": "perdendo",
    "mid": "neutro",
    "bot": "empatado",
    "obj": "Dragon 0:30, sem visão no pit",
    "ej": "sem info",
    "opts": [
      [
        "PEGAR VISÃO DO PIT PRIMEIRO",
        "G"
      ],
      [
        "RUSHAR DRAGON NO ESCURO",
        "I"
      ],
      [
        "GANK TOP",
        "R"
      ],
      [
        "TROCAR POR ARAUTO",
        "O"
      ]
    ],
    "exp": "Objetivo sem visão é coinflip. Sweep + ward, depois decida dragão ou troca.",
    "id": "jg-07",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Sion",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Irelia",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Jhin",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Renata",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Aphelios",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Rakan",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Sejuani",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 30
        }
      },
      "structures": {}
    }
  },
  {
    "type": "pathing",
    "time": "3:45",
    "you": "Evelynn",
    "hp": "70%",
    "ult": "NÃO",
    "top": "sem gank (tanks full HP)",
    "mid": "inimigo 30% sem flash",
    "bot": "empurrados pra sua torre",
    "obj": "Aronguejo bot up",
    "ej": "invadindo seu top side",
    "opts": [
      [
        "GANK MID (free kill)",
        "G"
      ],
      [
        "DEFENDER TOP SIDE 1v1",
        "R"
      ],
      [
        "ARONGUEJO BOT",
        "O"
      ],
      [
        "GANK TOP TANK FULL",
        "I"
      ]
    ],
    "exp": "Pathing eficiente: pegue a kill grátis mid, depois aronguejo. Top side perdida compensa com kill + aronguejo.",
    "id": "jg-08",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Cho'Gath",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Mundo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Katarina",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Samira",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Karma",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Twitch",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Zyra",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Evelynn",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "midBlueSide"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "RED_PUSHING"
        },
        "bot": {
          "waveState": "RED_PUSHING"
        }
      },
      "objectives": {
        "scuttleBot": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "tracking",
    "time": "5:30",
    "you": "Kindred",
    "hp": "90%",
    "ult": "NÃO",
    "top": "ward viu jungler inimigo no seu blue",
    "mid": "com prioridade",
    "bot": "sem prioridade",
    "obj": "sua marca no gromp inimigo",
    "ej": "no seu blue agora",
    "opts": [
      [
        "VERTICALIZAR + PEGAR MARCA",
        "G"
      ],
      [
        "LUTAR 1v1 NO BLUE",
        "R"
      ],
      [
        "GANK BOT SEM PRIORIDADE",
        "I"
      ],
      [
        "FARMAR E IGNORAR",
        "O"
      ]
    ],
    "exp": "Ele no seu blue = lado dele livre. Verticalize: pegue o campo dele + sua marca. Troca vencível.",
    "id": "jg-09",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Galio",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Brand",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Seraphine",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Kindred",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "redBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "INVADING",
          "currentPosition": "blueBuffBlue"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "RED_PUSHING"
        }
      },
      "objectives": {
        "mark": {
          "target": {"kind": "camp", "id": "grompRed"},
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "invade",
    "time": "4:10",
    "you": "Rek'Sai",
    "hp": "100%",
    "ult": "NÃO",
    "top": "sua top com prioridade",
    "mid": "sua mid com prioridade",
    "bot": "perdendo",
    "obj": "nada",
    "ej": "Amumu low após full clear, no red",
    "opts": [
      [
        "INVADIR RED COM PRIORIDADE",
        "G"
      ],
      [
        "GANK BOT PERDENDO",
        "R"
      ],
      [
        "FARMAR FULL CLEAR",
        "O"
      ],
      [
        "DIVE BOT",
        "I"
      ]
    ],
    "exp": "Dupla prioridade + inimigo low = invade grátis. Se ele lutar, seu time chega primeiro.",
    "id": "jg-10",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Darius",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Garen",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Syndra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Orianna",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ashe",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Milio",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Jinx",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Bard",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Rek'Sai",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "Amumu",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "VISIBLE",
          "currentPosition": "redBotJungle"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "RED_PUSHING"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "cross-map",
    "time": "6:00",
    "you": "Karthus",
    "hp": "100%",
    "ult": "READY",
    "top": "seu top sendo divado 2v1",
    "mid": "neutro",
    "bot": "inimigos low sob torre",
    "obj": "Dragon up",
    "ej": "top divando",
    "opts": [
      [
        "ULT + PEGAR DRAGON",
        "G"
      ],
      [
        "CORRER PRO TOP (longe)",
        "I"
      ],
      [
        "GANK MID",
        "R"
      ],
      [
        "FULL CLEAR IGNORANDO",
        "O"
      ]
    ],
    "exp": "Você não chega no top. Cross-map: ult ajuda top + Dragon grátis enquanto ele está longe.",
    "id": "jg-11",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Nasus",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Renekton",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Sivir",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Pyke",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Xayah",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Pantheon",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Karthus",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "DIVING",
          "currentPosition": "topBlueUnderT1"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_CRASHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_CRASHING"
        }
      },
      "objectives": {
        "dragon": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "scuttle",
    "time": "3:30",
    "you": "Xin Zhao",
    "hp": "80%",
    "ult": "NÃO",
    "top": "neutro",
    "mid": "sua mid sem prioridade (low mana)",
    "bot": "neutro",
    "obj": "ambos aronguejos up",
    "ej": "Udyr forte 1v1, indo pro top aronguejo",
    "opts": [
      [
        "ARONGUEJO OPOSTO (bot)",
        "G"
      ],
      [
        "LUTAR 1v1 SEM PRIORIDADE",
        "I"
      ],
      [
        "GANK TOP",
        "O"
      ],
      [
        "INVADIR",
        "R"
      ]
    ],
    "exp": "Sem prioridade mid contra Udyr = não lute aronguejo contestado. Pegue o oposto + gank.",
    "id": "jg-12",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Kassadin",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Talon",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Taric",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Sona",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Xin Zhao",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "Udyr",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "RED_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "scuttleTop": {
          "state": "UP"
        },
        "scuttleBot": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "lane priority",
    "time": "7:50",
    "you": "Hecarim",
    "hp": "85%",
    "ult": "READY",
    "top": "neutro",
    "mid": "sua mid precisa resetar (1500g)",
    "bot": "sua bot puxou e resetou",
    "obj": "arauto UP",
    "ej": "bot side",
    "opts": [
      [
        "COBRAR ARAUTO COM MID APÓS PUSH",
        "G"
      ],
      [
        "ARAUTO SOLO AGORA",
        "R"
      ],
      [
        "GANK TOP",
        "O"
      ],
      [
        "ESPERAR ELE FAZER",
        "I"
      ]
    ],
    "exp": "Espere sua mid puxar antes de arauto. Solo arauto com jungler vivo é arriscado.",
    "id": "jg-13",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Twisted Fate",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid",
          "state": "RECALLING",
          "currentPosition": "midBlueUnderT1"
        },
        "red-mid": {
          "champion": "Zoe",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot",
          "state": "RESETTING",
          "currentPosition": "blueBase"
        },
        "blue-support": {
          "champion": "Blitzcrank",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot",
          "state": "RESETTING",
          "currentPosition": "blueBase"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Zilean",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Hecarim",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "herald": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "gank window",
    "time": "5:20",
    "you": "Kha'Zix",
    "hp": "95%",
    "ult": "NÃO",
    "top": "neutro",
    "mid": "inimigo overextend sem flash",
    "bot": "neutro",
    "obj": "nada",
    "ej": "bot side farmando",
    "opts": [
      [
        "GANK MID",
        "G"
      ],
      [
        "INVADIR BOT COM ELE LÁ",
        "R"
      ],
      [
        "FULL CLEAR",
        "O"
      ],
      [
        "GANK TOP SEM SETUP",
        "I"
      ]
    ],
    "exp": "Mid sem flash overextend = janela clássica. Punir falta de flash é o básico do jungle.",
    "id": "jg-14",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Tahm Kench",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Poppy",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Kha'Zix",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "midBlueSide"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "RED_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "countergank",
    "time": "6:50",
    "you": "Skarner",
    "hp": "70%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "sua bot 60% com wave congelada, jungler visto perto",
    "obj": "Dragon 1:00",
    "ej": "rondando bot",
    "opts": [
      [
        "COBRAR COUNTERGANK BOT",
        "G"
      ],
      [
        "START DRAGON SOLO",
        "I"
      ],
      [
        "GANK MID",
        "O"
      ],
      [
        "RESET",
        "R"
      ]
    ],
    "exp": "Bot congelada atrai gank. Espere no counter — com ult você vira a fight.",
    "id": "jg-15",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Sion",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Irelia",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Jhin",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Rell",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Aphelios",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Samira",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Skarner",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_FREEZE"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 60
        }
      },
      "structures": {}
    }
  },
  {
    "type": "objective trade",
    "time": "13:00",
    "you": "Nocturne",
    "hp": "90%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "seu bot levou T1",
    "obj": "Dragon 0:20 · arauto UP · inimigos indo drag",
    "ej": "no drag com time",
    "opts": [
      [
        "TROCAR POR ARAUTO",
        "G"
      ],
      [
        "CONTESTAR 4v5 ATRASADO",
        "I"
      ],
      [
        "GANK TOP",
        "O"
      ],
      [
        "FARMAR",
        "R"
      ]
    ],
    "exp": "Eles com setup no drag = troque por arauto. Forçar 4v5 atrasado é throw.",
    "id": "jg-16",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Draven",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Thresh",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Sivir",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Nautilus",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Nocturne",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "VISIBLE",
          "currentPosition": "dragonPit"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_PUSHING"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 20
        },
        "herald": {
          "state": "UP"
        }
      },
      "structures": {
        "redBotT1": {
          "state": "DESTROYED",
          "platesRemaining": 0
        }
      }
    }
  },
  {
    "type": "bad dive",
    "time": "8:30",
    "you": "Pantheon",
    "hp": "60%",
    "ult": "READY",
    "top": "inimigo full com ult e flash sob torre",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "nada",
    "ej": "sumido",
    "opts": [
      [
        "GANK OUTRA LANE",
        "G"
      ],
      [
        "ESPERAR ELE GASTAR ULT",
        "O"
      ],
      [
        "DIVE 2v1 FULL",
        "I"
      ],
      [
        "INVADIR SEM INFO",
        "R"
      ]
    ],
    "exp": "Dive em alvo full com ult+flash = suicídio. Jogue em outra lane ou espere cooldowns.",
    "id": "jg-17",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Nasus",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Renekton",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Kassadin",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Talon",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Vayne",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Leona",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Xayah",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Braum",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Pantheon",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_CRASHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "reset timing",
    "time": "10:30",
    "you": "Diana",
    "hp": "50%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "Dragon 0:45, você tem 1600g",
    "ej": "full",
    "opts": [
      [
        "RESET + VOLTAR PRO DRAG",
        "G"
      ],
      [
        "FICAR LOW PRO DRAG",
        "I"
      ],
      [
        "GANK ALEATÓRIO LOW",
        "I"
      ],
      [
        "INVADIR LOW",
        "R"
      ]
    ],
    "exp": "1600g no bolso antes de dragão = reset obrigatório. Item fechado decide a fight.",
    "id": "jg-18",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Alistar",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Morgana",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Diana",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBase"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 45
        }
      },
      "structures": {}
    }
  },
  {
    "type": "tempo",
    "time": "11:00",
    "you": "Viego",
    "hp": "100%",
    "ult": "READY",
    "top": "inimigo top morto (TP gasto)",
    "mid": "sua mid com prioridade",
    "bot": "neutro",
    "obj": "arauto UP",
    "ej": "bot",
    "opts": [
      [
        "ARAUTO COM PRIORIDADE",
        "G"
      ],
      [
        "GANK BOT SEM SETUP",
        "R"
      ],
      [
        "FARMAR",
        "O"
      ],
      [
        "DIVE MID SEM INFO",
        "I"
      ]
    ],
    "exp": "Top morto sem TP + mid prioridade = arauto grátis. Janela de tempo perfeita.",
    "id": "jg-19",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top",
          "state": "DEAD"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Lulu",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Janna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Viego",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "herald": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "vision",
    "time": "16:00",
    "you": "Poppy",
    "hp": "80%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "Baron 1:00, mapa escuro",
    "ej": "sumido",
    "opts": [
      [
        "SETUP VISÃO BARON COM TIME",
        "G"
      ],
      [
        "RUSH BARON NO ESCURO",
        "I"
      ],
      [
        "FARMAR JG",
        "R"
      ],
      [
        "GANK SEM VISÃO",
        "R"
      ]
    ],
    "exp": "Baron sem visão aos 16 é armadilha. Setup com time primeiro, depois baite ou faça.",
    "id": "jg-20",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Nami",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Soraka",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Poppy",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "baron": {
          "state": "SPAWNING",
          "seconds": 60
        }
      },
      "structures": {
        "blueTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        }
      }
    }
  },
  {
    "type": "pathing",
    "time": "2:50",
    "you": "Shaco",
    "hp": "85%",
    "ult": "NÃO",
    "top": "neutro",
    "mid": "neutro",
    "bot": "inimigos lvl1 estendidos",
    "obj": "nada",
    "ej": "começou no seu lado oposto",
    "opts": [
      [
        "CHEESE GANK BOT LVL2",
        "G"
      ],
      [
        "FULL CLEAR PADRÃO",
        "O"
      ],
      [
        "INVADIR LVL2 SEM INFO",
        "R"
      ],
      [
        "GANK TOP SEM CC",
        "I"
      ]
    ],
    "exp": "Shaco lvl2 com bot estendido = cheese clássico. Ignite + box queima flashes cedo.",
    "id": "jg-21",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Cho'Gath",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Mundo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Katarina",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Galio",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Samira",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Yuumi",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Twitch",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Senna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Shaco",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "RED_PUSHING"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "tracking",
    "time": "7:00",
    "you": "Graves",
    "hp": "90%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "nada",
    "ej": "fez drag há 20s, deve estar bot side",
    "opts": [
      [
        "INVADIR TOP SIDE DELE",
        "G"
      ],
      [
        "LUTAR NO BOT SIDE DELE",
        "R"
      ],
      [
        "GANK BOT COM ELE PERTO",
        "R"
      ],
      [
        "RESET SEM MOTIVO",
        "I"
      ]
    ],
    "exp": "Ele acabou drag bot = top side livre. Invada e roube campos onde ele não está.",
    "id": "jg-22",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Renata",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Rakan",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Graves",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "redTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "dragonPit",
            "secondsAgo": 20
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "dragon": {
          "state": "DEAD"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "invade",
    "time": "9:30",
    "you": "Nidalee",
    "hp": "100%",
    "ult": "READY",
    "top": "perdendo feio",
    "mid": "vencendo com prioridade",
    "bot": "empatado",
    "obj": "arauto UP",
    "ej": "Sejuani no bot side",
    "opts": [
      [
        "INVADIR TOP COM MID",
        "G"
      ],
      [
        "GANK TOP PERDENDO",
        "I"
      ],
      [
        "ARAUTO SOLO SEM TOP",
        "R"
      ],
      [
        "FARMAR",
        "O"
      ]
    ],
    "exp": "Invada com sua mid forte. Gankar lane perdendo feio só dobra o prejuízo.",
    "id": "jg-23",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Nasus",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Renekton",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Syndra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Orianna",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Jhin",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Karma",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Aphelios",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Zyra",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Nidalee",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "Sejuani",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_PUSHING"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "herald": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "cross-map",
    "time": "5:45",
    "you": "Fiddlesticks",
    "hp": "75%",
    "ult": "NÃO (falta 20s)",
    "top": "fight 1v1 empatada",
    "mid": "neutro",
    "bot": "inimigos divando sua bot",
    "obj": "nada",
    "ej": "divando bot",
    "opts": [
      [
        "ARAUTO/VASTILARVAS ENQUANTO DIVAM",
        "G"
      ],
      [
        "CORRER PRA BOT SEM ULT",
        "I"
      ],
      [
        "GANK MID",
        "O"
      ],
      [
        "FARMAR JG LONGE",
        "R"
      ]
    ],
    "exp": "Sem ult e longe = não salve dive. Pegue objetivo cross-map enquanto 3 estão bot.",
    "id": "jg-24",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Brand",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Seraphine",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Fiddlesticks",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "DIVING",
          "currentPosition": "botBlueUnderT1"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "RED_CRASHING"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "scuttle",
    "time": "3:25",
    "you": "Warwick",
    "hp": "85%",
    "ult": "NÃO",
    "top": "sua top com prioridade",
    "mid": "sua mid com prioridade",
    "bot": "neutro",
    "obj": "aronguejo top up",
    "ej": "Evelynn fraca early indo contestar",
    "opts": [
      [
        "LUTAR ARONGUEJO COM PRIORIDADE",
        "G"
      ],
      [
        "DAR ARONGUEJO DE GRAÇA",
        "R"
      ],
      [
        "GANK BOT",
        "O"
      ],
      [
        "INVADIR SEM MATAR",
        "R"
      ]
    ],
    "exp": "WW early + dupla prioridade vs Eve = fight grátis. Abuse do early game.",
    "id": "jg-25",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Darius",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Garen",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Milio",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Bard",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Warwick",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "Evelynn",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "scuttleTop": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "lane priority",
    "time": "8:00",
    "you": "Amumu",
    "hp": "70%",
    "ult": "READY",
    "top": "neutro",
    "mid": "sua mid morta (vai nascer em 10s)",
    "bot": "sua bot com prioridade",
    "obj": "Dragon 0:15",
    "ej": "vivo com time",
    "opts": [
      [
        "ESPERAR MID NASCER",
        "G"
      ],
      [
        "DRAG 4v5 SEM MID",
        "I"
      ],
      [
        "GANK TOP",
        "O"
      ],
      [
        "TROCAR ARAUTO",
        "O"
      ]
    ],
    "exp": "Drag 4v5 sem mid = throw. Espere 10s ou troque objetivo.",
    "id": "jg-26",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Twisted Fate",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid",
          "state": "DEAD"
        },
        "red-mid": {
          "champion": "Zoe",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Draven",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Pyke",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Sivir",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Pantheon",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Amumu",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_PUSHING"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 15
        }
      },
      "structures": {}
    }
  },
  {
    "type": "gank window",
    "time": "4:20",
    "you": "Rengar",
    "hp": "100%",
    "ult": "NÃO",
    "top": "inimigo top sem ward (sweepou)",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "nada",
    "ej": "bot",
    "opts": [
      [
        "GANK TOP SEM VISÃO",
        "G"
      ],
      [
        "FARMAR 6 PRIMEIRO",
        "O"
      ],
      [
        "INVADIR COM ELE BOT",
        "O"
      ],
      [
        "GANK MID COM FLASH",
        "R"
      ]
    ],
    "exp": "Top sem ward + jungler longe = gank de manual. Pule do bush e queime flash.",
    "id": "jg-27",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Taric",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Sona",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Rengar",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "countergank",
    "time": "7:40",
    "you": "Maokai",
    "hp": "80%",
    "ult": "READY",
    "top": "sua top estendida sem flash",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "Vastilarvas up",
    "ej": "visto entrando top side",
    "opts": [
      [
        "COUNTERGANK TOP",
        "G"
      ],
      [
        "PEGAR VASTILARVAS ENQUANTO ELE GANKA",
        "O"
      ],
      [
        "GANK BOT",
        "R"
      ],
      [
        "RESET",
        "I"
      ]
    ],
    "exp": "Countergank com Maokai R vira fight. Vastilarvas são o plano B cross-map aceitável.",
    "id": "jg-28",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Blitzcrank",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Zilean",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Maokai",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "topRiver"
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "grubs": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "objective trade",
    "time": "20:00",
    "you": "Bel'Veth",
    "hp": "95%",
    "ult": "READY",
    "top": "neutro",
    "mid": "aliado empurrando",
    "bot": "seu split levando T2",
    "obj": "Baron UP · Dragon alma em 0:40",
    "ej": "time inimigo indo baron",
    "opts": [
      [
        "TROCAR BARON POR ALMA",
        "G"
      ],
      [
        "CORRER BARON 4v5",
        "I"
      ],
      [
        "LUTAR MID SEM SETUP",
        "R"
      ],
      [
        "PEGAR ACAMPAMENTO",
        "I"
      ]
    ],
    "exp": "Eles no Baron + alma up = troque. 4v5 no pit sem visão é GG throw.",
    "id": "jg-29",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Draven",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Tahm Kench",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Sivir",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Poppy",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Bel'Veth",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "BLUE_CRASHING",
          "frontT": 0.78,
          "reason": "Split aliado pressionando T2; T1 inimiga destruída"
        }
      },
      "objectives": {
        "baron": {
          "state": "UP"
        },
        "dragon": {
          "state": "SPAWNING",
          "seconds": 40
        }
      },
      "structures": {
        "redBotT1": {
          "state": "DESTROYED",
          "platesRemaining": 0
        },
        "blueTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        }
      }
    }
  },
  {
    "type": "bad dive",
    "time": "5:10",
    "you": "Elise",
    "hp": "40%",
    "ult": "NÃO",
    "top": "neutro",
    "mid": "inimigo 20% sob torre com barrier",
    "bot": "neutro",
    "obj": "nada",
    "ej": "sumido",
    "opts": [
      [
        "RESETAR E VOLTAR FULL",
        "G"
      ],
      [
        "TANKAR DIVE 40% HP",
        "I"
      ],
      [
        "ESPERAR ELE SAIR DA TORRE",
        "O"
      ],
      [
        "INVADIR 40% HP",
        "I"
      ]
    ],
    "exp": "40% HP + inimigo com barrier sob torre = reset. Dive low é presente pro inimigo.",
    "id": "jg-30",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Katarina",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Rell",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Samira",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Elise",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBase"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "BLUE_CRASHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "reset timing",
    "time": "14:00",
    "you": "Kayn",
    "hp": "90%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "DRAG EM 1:30, forma pronta no base?",
    "ej": "farmando",
    "opts": [
      [
        "RESET PRA FORMA + ITEM",
        "G"
      ],
      [
        "FICAR SEM FORMA PRO BARON",
        "I"
      ],
      [
        "FORÇAR FIGHT SEM FORMA",
        "R"
      ],
      [
        "GANK SEM ULT",
        "O"
      ]
    ],
    "exp": "Kayn sem forma perto de drag = reset. Forma + item > 1 acampamento.",
    "id": "jg-31",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Thresh",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Nautilus",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Kayn",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBase"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 90
        }
      },
      "structures": {
        "blueTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        }
      }
    }
  },
  {
    "type": "tempo",
    "time": "9:50",
    "you": "Ekko",
    "hp": "85%",
    "ult": "READY",
    "top": "neutro",
    "mid": "inimigo mid morto 15s",
    "bot": "neutro",
    "obj": "arauto UP",
    "ej": "morto junto",
    "opts": [
      [
        "ARAUTO GRÁTIS",
        "G"
      ],
      [
        "DIVE BOT SEM INFO",
        "R"
      ],
      [
        "FARMAR JG",
        "O"
      ],
      [
        "RESET DESNECESSÁRIO",
        "I"
      ]
    ],
    "exp": "Mid + jungler mortos = arauto sem contestação. Tempo é recurso: converta em objetivo.",
    "id": "jg-32",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid",
          "state": "DEAD"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Leona",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Braum",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Ekko",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "DEAD"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "herald": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "vision",
    "time": "12:30",
    "you": "Zac",
    "hp": "75%",
    "ult": "READY",
    "top": "aliado recuando",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "Dragon 0:20, pit sem visão",
    "ej": "sumido",
    "opts": [
      [
        "SWEEP + WARD PIT COM TIME",
        "G"
      ],
      [
        "FACECHECK SOLO",
        "I"
      ],
      [
        "PULEAR DE QUALQUER JEITO",
        "R"
      ],
      [
        "DESISTIR DO DRAG",
        "R"
      ]
    ],
    "exp": "Zac quer engage no escuro? Não. Visão primeiro, depois E de ângulo cego.",
    "id": "jg-33",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Alistar",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Morgana",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Zac",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 20
        }
      },
      "structures": {}
    }
  },
  {
    "type": "pathing",
    "time": "6:20",
    "you": "Udyr",
    "hp": "95%",
    "ult": "NÃO",
    "top": "neutro, sem gank",
    "mid": "neutro",
    "bot": "sua bot vai crashar wave e resetar",
    "obj": "Dragon 1:00",
    "ej": "top",
    "opts": [
      [
        "PATHING PRA BAIXO PRO DRAG",
        "G"
      ],
      [
        "FICAR TOP SEM MOTIVO",
        "R"
      ],
      [
        "GANK TOP SEM SETUP",
        "I"
      ],
      [
        "INVADIR TOP COM ELE LÁ",
        "R"
      ]
    ],
    "exp": "Pathing pro próximo objetivo > farm aleatório. Desça farmando em direção ao drag.",
    "id": "jg-34",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Draven",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Lulu",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Sivir",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Janna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Udyr",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_CRASHING"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 60
        }
      },
      "structures": {}
    }
  },
  {
    "type": "tracking",
    "time": "8:45",
    "you": "Lillia",
    "hp": "80%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "nada",
    "ej": "gankou top e mostrou 30% HP",
    "opts": [
      [
        "INVADIR TOP SIDE (ele low)",
        "G"
      ],
      [
        "GANK TOP ATRASADO",
        "R"
      ],
      [
        "FARMAR BOT",
        "O"
      ],
      [
        "DIVE TOP",
        "I"
      ]
    ],
    "exp": "Ele mostrou low top = invada o lado dele. Ele precisa resetar, campos grátis.",
    "id": "jg-35",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Nami",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Soraka",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Lillia",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "redTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "topRedSide"
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "invade",
    "time": "3:00",
    "you": "Olaf",
    "hp": "100%",
    "ult": "NÃO",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "nada",
    "ej": "Evelynn no próprio blue, low",
    "opts": [
      [
        "INVADIR BLUE LVL3 (Olaf > Eve)",
        "G"
      ],
      [
        "FULL CLEAR PACÍFICO",
        "O"
      ],
      [
        "GANK SEM LANES SETADAS",
        "R"
      ],
      [
        "TROCAR DE LADO SEM MOTIVO",
        "I"
      ]
    ],
    "exp": "Olaf lvl3 vs Eve low = invade clássico. Atrasar Eve early vale ouro.",
    "id": "jg-36",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Cho'Gath",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Mundo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Katarina",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Galio",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Samira",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Yuumi",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Twitch",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Senna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Olaf",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "redBotRiverEntrance"
        },
        "red-jungle": {
          "champion": "Evelynn",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "VISIBLE",
          "currentPosition": "blueBuffRed"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "cross-map",
    "time": "10:00",
    "you": "Shyvana",
    "hp": "100%",
    "ult": "READY",
    "top": "seu top morto, inimigos levando T1",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "Dragon UP",
    "ej": "top levando torre",
    "opts": [
      [
        "DRAGON ENQUANTO LEVAM TOP",
        "G"
      ],
      [
        "DEFENDER T1 SOZINHO",
        "I"
      ],
      [
        "FARMAR",
        "O"
      ],
      [
        "LUTAR 1v3",
        "I"
      ]
    ],
    "exp": "T1 top perdida = aceite e troque por drag. Morrer defendendo sozinho é int duplo.",
    "id": "jg-37",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Nasus",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top",
          "state": "DEAD"
        },
        "red-top": {
          "champion": "Renekton",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Sivir",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Renata",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Xayah",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Rakan",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Shyvana",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "topBlueUnderT1"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_CRASHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "dragon": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "scuttle",
    "time": "8:00",
    "you": "Viego",
    "hp": "60%",
    "ult": "READY",
    "top": "neutro",
    "mid": "sua mid low recuando",
    "bot": "neutro",
    "obj": "arauto UP + aronguejo",
    "ej": "full HP com mid",
    "opts": [
      [
        "DAR ARAUTO, FARMAR E RESETAR",
        "G"
      ],
      [
        "LUTAR 1v2 LOW",
        "I"
      ],
      [
        "GANK SEM HP",
        "I"
      ],
      [
        "WARDAR E ESPERAR",
        "O"
      ]
    ],
    "exp": "60% sem mid vs 2 full = entregue arauto. Viver > morrer por objetivo perdido.",
    "id": "jg-38",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Karma",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Zyra",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Viego",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "RED_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "herald": {
          "state": "UP"
        },
        "scuttleTop": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "lane priority",
    "time": "15:00",
    "you": "Jarvan IV",
    "hp": "85%",
    "ult": "READY",
    "top": "sua top sem TP",
    "mid": "waves neutras",
    "bot": "neutro",
    "obj": "Baron 0:30",
    "ej": "vivo",
    "opts": [
      [
        "PUXAR WAVES ANTES DO BARON",
        "G"
      ],
      [
        "RUSH BARON SEM WAVES",
        "R"
      ],
      [
        "LUTAR MID SEM SETUP",
        "R"
      ],
      [
        "GANK ALEATÓRIO",
        "I"
      ]
    ],
    "exp": "Baron sem waves puxadas = inimigo chega de graça. Empurre sides, depois Baron.",
    "id": "jg-39",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Brand",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Seraphine",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Jarvan IV",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "baron": {
          "state": "SPAWNING",
          "seconds": 30
        }
      },
      "structures": {
        "blueTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        }
      }
    }
  },
  {
    "type": "gank window",
    "time": "7:10",
    "you": "Sylas",
    "hp": "80%",
    "ult": "READY (roubou Malphite)",
    "top": "neutro",
    "mid": "inimigos agrupados mid, sem MR",
    "bot": "neutro",
    "obj": "nada",
    "ej": "longe",
    "opts": [
      [
        "GANK MID COM ULT ROUBADA",
        "G"
      ],
      [
        "FARMAR JG",
        "R"
      ],
      [
        "GANK BOT SEM SETUP",
        "O"
      ],
      [
        "INVADIR SEM INFO",
        "R"
      ]
    ],
    "exp": "Ult de Malphite roubada + inimigos juntos = combo de highlight. Vá mid.",
    "id": "jg-40",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Katarina",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Milio",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Bard",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Sylas",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "midBlueSide"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "countergank",
    "time": "5:50",
    "you": "Trundle",
    "hp": "90%",
    "ult": "NÃO",
    "top": "neutro",
    "mid": "neutro",
    "bot": "sua bot baitando (fingindo recall)",
    "obj": "nada",
    "ej": "indo bot (vão cair no bait)",
    "opts": [
      [
        "ESPERAR NO BUSH COUNTERGANK",
        "G"
      ],
      [
        "APARECER CEDO E ESTRAGAR",
        "R"
      ],
      [
        "FARMAR E IGNORAR BAIT",
        "O"
      ],
      [
        "DIVE COM BOT LOW",
        "I"
      ]
    ],
    "exp": "Bait armado = paciência. Aparecer cedo estraga; espere ele commitar e puna.",
    "id": "jg-41",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Pyke",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Pantheon",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Trundle",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_FREEZE"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "objective trade",
    "time": "6:40",
    "you": "Ivern",
    "hp": "70%",
    "ult": "NÃO",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "Vastilarvas UP · Drag UP · time todo top",
    "ej": "fazendo drag solo",
    "opts": [
      [
        "PEGAR VASTILARVAS COM TIME",
        "G"
      ],
      [
        "CONTESTAR DRAG SOLO",
        "I"
      ],
      [
        "GANK SEM ULT",
        "R"
      ],
      [
        "FARMAR",
        "O"
      ]
    ],
    "exp": "Time todo top = Vastilarvas grátis. Ivern não contesta drag solo contra jungler.",
    "id": "jg-42",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid",
          "state": "ROTATING",
          "currentPosition": "topRiver"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot",
          "state": "ROTATING",
          "currentPosition": "blueTopJungle"
        },
        "blue-support": {
          "champion": "Taric",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot",
          "state": "SETTING_OBJECTIVE",
          "currentPosition": "grubsEntrance"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Sona",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Ivern",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "TAKING_OBJECTIVE",
          "currentPosition": "dragonPit"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "grubs": {
          "state": "UP"
        },
        "dragon": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "tempo",
    "time": "18:30",
    "you": "Kha'Zix",
    "hp": "100%",
    "ult": "READY",
    "top": "neutro",
    "mid": "pickoff: inimigo ADC morto 25s",
    "bot": "aliado crashando wave",
    "obj": "Baron UP",
    "ej": "jungler inimigo vivo; ADC inimigo morto",
    "opts": [
      [
        "FORÇAR BARON 5v4",
        "G"
      ],
      [
        "FARMAR JG",
        "R"
      ],
      [
        "GANK SEM ALVO",
        "I"
      ],
      [
        "RESET",
        "I"
      ]
    ],
    "exp": "ADC morto 25s = Baron 5v4. Janela de tempo: force agora antes dele nascer.",
    "id": "jg-43",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Blitzcrank",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot",
          "state": "DEAD"
        },
        "red-support": {
          "champion": "Zilean",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Kha'Zix",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_CRASHING"
        }
      },
      "objectives": {
        "baron": {
          "state": "UP"
        }
      },
      "structures": {
        "blueTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        }
      }
    }
  },
  {
    "type": "vision",
    "time": "21:00",
    "you": "Rammus",
    "hp": "90%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "BARON UP, SEM VISÃO NO MAPA",
    "ej": "sumido",
    "opts": [
      [
        "SETUP VISÃO BARON COM TIME",
        "G"
      ],
      [
        "RUSH BARON SEM VISÃO",
        "I"
      ],
      [
        "HOVER MID ESPERANDO INFO",
        "R"
      ],
      [
        "FARMAR JG IGNORANDO BARON",
        "R"
      ]
    ],
    "exp": "Baron sem visão = roleta russa. Rammus quer correr com visão, não facecheck.",
    "id": "jg-44",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Tahm Kench",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Poppy",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Rammus",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "baron": {
          "state": "UP"
        }
      },
      "structures": {
        "blueTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "blueBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redTopT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redMidT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        },
        "redBotT1": {
          "state": "ALIVE",
          "platesRemaining": 0
        }
      }
    }
  },
  {
    "type": "pathing",
    "time": "4:50",
    "you": "Master Yi",
    "hp": "90%",
    "ult": "NÃO",
    "top": "inimigo top overextend",
    "mid": "neutro",
    "bot": "neutro",
    "obj": "Vastilarvas em 30s",
    "ej": "bot side",
    "opts": [
      [
        "GANK TOP + VASTILARVAS",
        "G"
      ],
      [
        "FARMAR ATÉ 6 IGNORANDO TUDO",
        "R"
      ],
      [
        "GANK BOT LONGE",
        "I"
      ],
      [
        "INVADIR BOT COM ELE",
        "R"
      ]
    ],
    "exp": "Top overextend + Vastilarvas perto + ele longe = sequência perfeita top side.",
    "id": "jg-45",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Rell",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Samira",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Master Yi",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "grubs": {
          "state": "SPAWNING",
          "seconds": 30
        }
      },
      "structures": {}
    }
  },
  {
    "type": "tracking",
    "time": "11:30",
    "you": "Fiddle",
    "hp": "85%",
    "ult": "READY",
    "top": "neutro",
    "mid": "aliado com prio",
    "bot": "neutro",
    "obj": "Dragon 0:30",
    "ej": "mostrou top agora",
    "opts": [
      [
        "SETUP EMBOSCADA NO DRAG",
        "G"
      ],
      [
        "ULTAR TOP DO OUTRO LADO",
        "I"
      ],
      [
        "FARMAR",
        "O"
      ],
      [
        "GANK SEM VISÃO",
        "R"
      ]
    ],
    "exp": "Ele top + drag em 30s = seu ult decide. Posicione no pixel bush e espere.",
    "id": "jg-46",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Thresh",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Nautilus",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Fiddle",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "topRiver",
            "secondsAgo": 0
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {
        "dragon": {
          "state": "SPAWNING",
          "seconds": 30
        }
      },
      "structures": {}
    }
  },
  {
    "type": "invade",
    "time": "12:00",
    "you": "Bel'Veth",
    "hp": "100%",
    "ult": "READY",
    "top": "sua top com prioridade e TP",
    "mid": "sua mid vencendo",
    "bot": "neutro",
    "obj": "nada",
    "ej": "morto 10s",
    "opts": [
      [
        "ROUBAR JG INTEIRO + ARAUTO?",
        "G"
      ],
      [
        "FARMAR SÓ SEU LADO",
        "R"
      ],
      [
        "GANK BOT SEM SETUP",
        "O"
      ],
      [
        "RESET SEM GOLD",
        "I"
      ]
    ],
    "exp": "Jungler morto + prioridade = roube tudo. Bel'Veth snowballa com farm inimigo.",
    "id": "jg-47",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Fiora",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Teemo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Zed",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Annie",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Caitlyn",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Leona",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Varus",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Braum",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Bel'Veth",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "redTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "DEAD"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "BLUE_PUSHING"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "cross-map",
    "time": "7:30",
    "you": "Nocturne",
    "hp": "85%",
    "ult": "READY",
    "top": "fight top 1v1",
    "mid": "neutro",
    "bot": "sua bot recuando, inimigos divando?",
    "obj": "arauto UP",
    "ej": "bot",
    "opts": [
      [
        "ULT TOP + ARAUTO",
        "G"
      ],
      [
        "ULT BOT SEM VISÃO",
        "R"
      ],
      [
        "FARMAR COM ULT UP",
        "R"
      ],
      [
        "CORRER PRO BOT",
        "I"
      ]
    ],
    "exp": "Nocturne: ult no top + arauto. Ult parada é ult desperdiçada.",
    "id": "jg-48",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Alistar",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Morgana",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Nocturne",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "RED_CRASHING"
        }
      },
      "objectives": {
        "herald": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "scuttle",
    "time": "3:20",
    "you": "Amumu",
    "hp": "75%",
    "ult": "NÃO",
    "top": "sem prioridade",
    "mid": "sem prioridade",
    "bot": "sua bot com prioridade",
    "obj": "aronguejo top e bot",
    "ej": "Xin Zhao indo top",
    "opts": [
      [
        "ARONGUEJO BOT COM PRIORIDADE",
        "G"
      ],
      [
        "CONTESTAR TOP SEM NADA",
        "I"
      ],
      [
        "GANK MID",
        "O"
      ],
      [
        "FULL CLEAR SEM ARONGUEJO",
        "R"
      ]
    ],
    "exp": "Amumu não luta Xin sem prioridade. Pegue o aronguejo do lado com prioridade.",
    "id": "jg-49",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Cho'Gath",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Mundo",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Katarina",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Galio",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Samira",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Lulu",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Twitch",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Janna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Amumu",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBotJungle"
        },
        "red-jungle": {
          "champion": "Xin Zhao",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_PUSHING"
        },
        "mid": {
          "waveState": "RED_PUSHING"
        },
        "bot": {
          "waveState": "BLUE_PUSHING"
        }
      },
      "objectives": {
        "scuttleTop": {
          "state": "UP"
        },
        "scuttleBot": {
          "state": "UP"
        }
      },
      "structures": {}
    }
  },
  {
    "type": "bad dive",
    "time": "9:00",
    "you": "Jax",
    "hp": "65%",
    "ult": "READY",
    "top": "inimigo 90% com flash e heal, sua top 40%",
    "mid": "mid inimigo sumido",
    "bot": "neutro",
    "obj": "nada",
    "ej": "sumido há 40s",
    "opts": [
      [
        "NÃO DIVAR, JOGAR MID/BOT",
        "G"
      ],
      [
        "WARDAR E TRACKING",
        "O"
      ],
      [
        "DIVE 2v1 SEM INFO",
        "I"
      ],
      [
        "ESPERAR MID APARECER E DIVE",
        "R"
      ]
    ],
    "exp": "Sem info de 2 inimigos + alvo saudável = não dive. Jogue onde há visão.",
    "id": "jg-50",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Nasus",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Renekton",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Kassadin",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Talon",
          "role": "MID",
          "team": "red",
          "homeLane": "mid",
          "state": "MISSING"
        },
        "blue-adc": {
          "champion": "Vayne",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Nami",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Xayah",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Soraka",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Jax",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "BLUE_PUSHING"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {}
    }
  },
  {
    "type": "reset timing",
    "time": "6:55",
    "you": "Vi",
    "hp": "95%",
    "ult": "READY",
    "top": "neutro",
    "mid": "neutro",
    "bot": "wave crashando torre inimiga",
    "obj": "Vastilarvas/Drag 0:40, 1300g no bolso",
    "ej": "resetando",
    "opts": [
      [
        "RESET RÁPIDO E OBJETIVO",
        "G"
      ],
      [
        "FICAR COM GOLD PARADO",
        "R"
      ],
      [
        "LUTAR SEM ITEM",
        "R"
      ],
      [
        "GANK SEM MOTIVO",
        "I"
      ]
    ],
    "exp": "Ele resetando = resete junto e volte de item. Gold parado não ganha fight.",
    "id": "jg-51",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Shen",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Camille",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Lissandra",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Akali",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Ezreal",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot"
        },
        "blue-support": {
          "champion": "Yuumi",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot"
        },
        "red-adc": {
          "champion": "Lucian",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Senna",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Vi",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueBase"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "UNKNOWN"
        }
      },
      "lanes": {
        "top": {
          "waveState": "NEUTRAL"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "BLUE_CRASHING"
        }
      },
      "objectives": {
        "grubs": {
          "state": "SPAWNING",
          "seconds": 40
        },
        "dragon": {
          "state": "SPAWNING",
          "seconds": 40
        }
      },
      "structures": {}
    }
  },
  {
    "type": "pathing",
    "time": "13:30",
    "you": "Hecarim",
    "hp": "80%",
    "ult": "READY",
    "top": "wave gigante crashando na sua T2",
    "mid": "neutro",
    "bot": "time grupado mid",
    "obj": "nada iminente",
    "ej": "mostrou bot",
    "opts": [
      [
        "PEGAR WAVE TOP + AGRUPAR",
        "G"
      ],
      [
        "IGNORAR WAVE E ARAM MID",
        "R"
      ],
      [
        "FARMAR JG INIMIGO BOT",
        "R"
      ],
      [
        "DIVE SEM TIME",
        "I"
      ]
    ],
    "exp": "Wave gigante na T2 = gold grátis + evita queda. Pegue e agrupe depois.",
    "id": "jg-52",
    "state": {
      "actors": {
        "blue-top": {
          "champion": "Gangplank",
          "role": "TOP",
          "team": "blue",
          "homeLane": "top"
        },
        "red-top": {
          "champion": "Urgot",
          "role": "TOP",
          "team": "red",
          "homeLane": "top"
        },
        "blue-mid": {
          "champion": "Azir",
          "role": "MID",
          "team": "blue",
          "homeLane": "mid"
        },
        "red-mid": {
          "champion": "Viktor",
          "role": "MID",
          "team": "red",
          "homeLane": "mid"
        },
        "blue-adc": {
          "champion": "Tristana",
          "role": "ADC",
          "team": "blue",
          "homeLane": "bot",
          "state": "ROTATING",
          "currentPosition": "midRiver"
        },
        "blue-support": {
          "champion": "Renata",
          "role": "SUPPORT",
          "team": "blue",
          "homeLane": "bot",
          "state": "ROTATING",
          "currentPosition": "midRiver"
        },
        "red-adc": {
          "champion": "Kog'Maw",
          "role": "ADC",
          "team": "red",
          "homeLane": "bot"
        },
        "red-support": {
          "champion": "Rakan",
          "role": "SUPPORT",
          "team": "red",
          "homeLane": "bot"
        },
        "blue-jungle": {
          "champion": "Hecarim",
          "role": "JUNGLE",
          "team": "blue",
          "homeLane": "jungle",
          "state": "ACTIVE",
          "currentPosition": "blueTopJungle"
        },
        "red-jungle": {
          "champion": "JG INIMIGO",
          "role": "JUNGLE",
          "team": "red",
          "homeLane": "jungle",
          "state": "LAST_SEEN",
          "lastSeen": {
            "position": "botRiver"
          }
        }
      },
      "lanes": {
        "top": {
          "waveState": "RED_CRASHING",
          "frontT": 0.14,
          "reason": "Wave na T2 azul; T1 azul destruída"
        },
        "mid": {
          "waveState": "NEUTRAL"
        },
        "bot": {
          "waveState": "NEUTRAL"
        }
      },
      "objectives": {},
      "structures": {
        "blueTopT1": {
          "state": "DESTROYED",
          "platesRemaining": 0
        }
      }
    }
  }
];
