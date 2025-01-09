class WordGame{
    selectors = {
        playerOneName: '[data-js-player-one-name]',
        playerTwoName: '[data-js-player-two-name]',
        wordBox: '[data-js-word-box]',
        word: '[data-js-word]',
        playerOneSide: '[data-js-player-one-side]',
        playerTwoSide: '[data-js-player-two-side]',
        menuOverlay: '[data-js-menu-overlay]',
        startButton: '[data-js-start-button]',
        restartOverlay: '[data-js-restart-overlay]',
        winner: '[data-js-restart-winner]',
        playerOneScore: '[data-js-player-one-score]',
        playerTwoScore: '[data-js-player-two-score]',
        restartButton: '[data-js-restart-button]'
    }

    initialState = {
        playerOneTurn: false,
        playerTwoTurn: false,
        playerOneHeight: 50,
        playerTwoHeight: 50,
        gameStarted: false
    }

    gameInfo = {
        playerOneName: 'Игрок 1',
        playerTwoName: 'Игрок 2',
        playerOneScore: 0,
        playerTwoScore: 0
    }

    constructor() {
        this.wordBoxElement = document.querySelector(this.selectors.wordBox)
        this.wordElement = document.querySelector(this.selectors.word)
        this.playerOneNameElement = document.querySelector(this.selectors.playerOneName)
        this.playerTwoNameElement = document.querySelector(this.selectors.playerTwoName)
        this.playerOneSideElement = document.querySelector(this.selectors.playerOneSide)
        this.playerTwoSideElement = document.querySelector(this.selectors.playerTwoSide)
        this.menuOverlayElement = document.querySelector(this.selectors.menuOverlay)
        this.startButtonElement = document.querySelector(this.selectors.startButton)
        this.restartOverlayElement = document.querySelector(this.selectors.restartOverlay)
        this.winnerElement = document.querySelector(this.selectors.winner)
        this.playerOneScoreElement = document.querySelector(this.selectors.playerOneScore)
        this.playerTwoScoreElement = document.querySelector(this.selectors.playerTwoScore)
        this.restartButtonElement = document.querySelector(this.selectors.restartButton)
        this.wordElement.style.opacity = 0
        this.state = {...this.initialState}
        this.themes = JSON.parse(localStorage.getItem('themes'))
        if(!this.themes) {
            this.loadThemes()
        } else {
            this.setRandomTheme()
        }
        this.bindEvents()
    }

    loadThemes() {
        fetch('themes.json')
        .then((respone) => {
            if(!respone.ok) {
                throw new Error()
            }
            return respone.json()
        })
        .then((json) => {
            this.themes = json.themes
            this.saveThemes()
            this.setRandomTheme()
        })
        .catch(() => {
            this.wordElement.textContent = "Что-то пошло не так :("
        }) 
    }

    saveThemes = () => {
        localStorage.setItem('themes', JSON.stringify(this.themes))
    }

    setRandomTheme() {
        if (this.themes && this.themes.length > 0) {
            const index = Math.floor(Math.random() * this.themes.length)
            const theme = this.themes[index]
            this.themes.splice(index, 1)
            this.saveThemes()
            this.wordElement.textContent = theme
        } else {
            this.loadThemes()
        }
    }

    updatePlayersSizes = () => {
        if (this.state.playerOneTurn) {
            this.state.playerOneHeight = Math.min(this.state.playerOneHeight + 5, 100)
            this.state.playerTwoHeight = Math.max(this.state.playerTwoHeight - 5, 0)
        } 
        else if (this.state.playerTwoTurn) {
            this.state.playerOneHeight = Math.max(this.state.playerOneHeight - 5, 0)
            this.state.playerTwoHeight = Math.min(this.state.playerTwoHeight + 5, 100)
        }
        
        const root = document.documentElement;
        root.style.setProperty('--height-player-one', `${this.state.playerOneHeight}%`)
        root.style.setProperty('--height-player-two', `${this.state.playerTwoHeight}%`)
        
        if (this.state.playerOneHeight === 100 || this.state.playerTwoHeight === 100) {
            clearInterval(this.intervalId)
            document.removeEventListener("click", this.onClick)
            document.removeEventListener("keydown", this.onKeyDown)
            this.wordElement.style.opacity = 0
            this.restartOverlayElement.classList.remove('restart-hidden')
                                     
            if(this.state.playerOneHeight === 100 ){
                this.gameInfo.playerOneScore++
                this.winnerElement.textContent = `Победитель ${this.gameInfo.playerOneName}`
            }
            else if (this.state.playerTwoHeight === 100 ){
                this.gameInfo.playerTwoScore++
                this.winnerElement.textContent = `Победитель ${this.gameInfo.playerTwoName}`
            }
            
            this.playerOneScoreElement.textContent = `${this.gameInfo.playerOneName}: ${this.gameInfo.playerOneScore}`
            this.playerTwoScoreElement.textContent = `${this.gameInfo.playerTwoName}: ${this.gameInfo.playerTwoScore}`
        }
    }

    switchTurn = () => {
        if (!this.state.gameStarted) {
            this.state.gameStarted = true
            this.state.playerOneTurn = true
            this.intervalId = setInterval(this.updatePlayersSizes, 500 )
            return
        }
        else if(this.state.gameStarted) {
            this.state.playerOneTurn = !this.state.playerOneTurn
            this.state.playerTwoTurn = !this.state.playerTwoTurn
        }
    }

    onStartGame = () => {
        this.menuOverlayElement.classList.add('menu-overlay-hidden');
        this.wordElement.style.opacity = 1
        this.gameInfo.playerOneName = this.playerOneNameElement.value
        this.gameInfo.playerTwoName = this.playerTwoNameElement.value
        document.activeElement.blur()
    }
    
    onClick = () => {
        if(event.target.closest('main')){
            this.switchTurn()
        }
    }

    onKeyDown = () => {
        if(this.menuOverlayElement.classList.contains('menu-overlay-hidden')){
            this.switchTurn()
        }
    }

    onRestart = () => {
        clearInterval(this.intervalId)
        this.state = {...this.initialState}
        this.restartOverlayElement.classList.add('restart-hidden');
        this.wordElement.style.opacity = 1
        this.updatePlayersSizes();
        this.setRandomTheme()
        document.addEventListener("click", this.onClick)
        document.addEventListener("keydown", this.onKeyDown)
        document.activeElement.blur()
    }

    bindEvents() {
        document.addEventListener("click", this.onClick)
        document.addEventListener('keydown', this.onKeyDown)
        this.startButtonElement.addEventListener('click', this.onStartGame)
        this.restartButtonElement.addEventListener('click', this.onRestart)
    }
}

new WordGame()