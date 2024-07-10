const WIDTH = 500;
const HEIGHT = 500;

(()=>{
	const roulette = document.getElementById("roulette") as HTMLCanvasElement;
	console.log(roulette);
	if(roulette === null) throw new Error("No canvas with name id 'roulette' is found.");
	roulette.width = WIDTH;
	roulette.height = HEIGHT;

	const ctx = roulette.getContext("2d") as CanvasRenderingContext2D;
	if(ctx === null) throw new Error("2D contex is not supported.");
	console.log(ctx);

	const textInput = document.getElementById('textInput') as HTMLTextAreaElement;
	if(textInput === null) throw new Error("No text area with name id 'textInput' is found.");

    const drawButton = document.getElementById('drawButton') as HTMLButtonElement;
	if(drawButton === null) throw new Error("No button with name id 'drawButton' is found.");

	const x = roulette.width / 2; // Coordinata x del centro
    const y = roulette.height / 2; // Coordinata y del centro
    const radius = roulette.width / 2.1; // Raggio del cerchio
    
	let lines: string[] = [];
	let angleOffset = 0;
	let isRotating = false;
	let lastTickAngle = 0;

	//https://www.soundjay.com/misc/velcro-strap-2.mp3
	//https://www.soundjay.com/misc/whip-whoosh-01.mp3
	//https://www.soundjay.com/misc/whip-whoosh-03.mp3

	const tickSound = new Audio('https://www.soundjay.com/misc/whip-whoosh-03.mp3');
	const endSound = new Audio('https://www.soundjay.com/misc/coins-in-hand-1.mp3')

	drawCircle();

	function drawCircle(){
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI);
		ctx.lineWidth = 4;
		ctx.strokeStyle = 'white';
		ctx.stroke();

		// Disegna il triangolo indicatore
		ctx.beginPath();
		ctx.moveTo(x + radius - 20, y); // Punta del triangolo
		ctx.lineTo(x + radius + 10, y - 10); // Base sinistra del triangolo
		ctx.lineTo(x + radius + 10, y + 10); // Base destra del triangolo
		ctx.closePath();

		ctx.fillStyle = 'green';
		ctx.fill();
	}

	const drawSlices = () => {
		ctx.clearRect(0, 0, WIDTH, HEIGHT); // Pulisce il canvas
		
		const totalLines = lines.length;
		if(totalLines === 1 && lines[0] === ''){
			drawCircle();
			return;
		}
		const anglePerSlice = (2 * Math.PI) / totalLines;

		lines.forEach((line, index) => {
			const startAngle = index * anglePerSlice + angleOffset;
			const endAngle = startAngle + anglePerSlice;
	
			ctx.beginPath();
			ctx.moveTo(x, y);
			ctx.arc(x, y, radius, startAngle, endAngle);
			ctx.closePath();
	
			ctx.lineWidth = 4;
			ctx.strokeStyle = 'white';
			ctx.stroke();
	
			ctx.save();
            const textAngle = startAngle + anglePerSlice / 2;
            ctx.translate(x, y);
            ctx.rotate(textAngle);
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(line, radius / 2, 0);
            ctx.restore();
		});

		// Disegna il triangolo indicatore
		ctx.beginPath();
		ctx.moveTo(x + radius - 20, y); // Punta del triangolo
		ctx.lineTo(x + radius + 10, y - 10); // Base sinistra del triangolo
		ctx.lineTo(x + radius + 10, y + 10); // Base destra del triangolo
		ctx.closePath();

		ctx.fillStyle = 'green';
		ctx.fill();
	};

	const getSliceValueAtAngle = (targetAngle: number) => {
		const totalLines = lines.length;
		const anglePerSlice = (2 * Math.PI) / totalLines;

		const index = Math.floor((targetAngle - angleOffset) / anglePerSlice) % totalLines;
		endSound.play();
		return lines[(index + totalLines) % totalLines];
	};

	const startRotation = () => {
		const totalLines = lines.length;
		const anglePerSlice = (2 * Math.PI) / totalLines;

		const rotationDuration = Math.random() * (8000 - 5000) + 5000; // Durata della rotazione in millisecondi
		const startTime = Date.now();
		console.log(rotationDuration);

		const rotate = () => {
			const currentTime = Date.now();
			const elapsedTime = currentTime - startTime;
			const timeFraction = elapsedTime / rotationDuration;

			if (elapsedTime < rotationDuration) {
				const easeOutQuad = (t: number) => t * (2 - t);
                const currentSpeed = easeOutQuad(1 - timeFraction) * 0.05;
                angleOffset += currentSpeed;

				const tickAngle = angleOffset % anglePerSlice;
                if (tickAngle <= 0.01 + currentSpeed) {
                    tickSound.play();
                }
                lastTickAngle = angleOffset % (2 * Math.PI);
				//console.log("angles", tickAngle, angleOffset);
				//console.log(currentSpeed);
				drawSlices();
				requestAnimationFrame(rotate);
			} else {
				isRotating = false;
				const targetAngle = 0; // Modifica questo valore per cambiare la posizione di arrivo
				const result = getSliceValueAtAngle(targetAngle);
				alert(`\"${result}\" has WON!!`); // Mostra il valore della fetta verticale
			}
		};
		if (!isRotating) {
			isRotating = true;
			rotate();
		}
	};

	// Aggiungi evento click al pulsante
	drawButton.addEventListener('click', () => {
		if(isRotating)
			return;
		lines = textInput.value.split('\n');
		drawSlices();
	});

	// Aggiungi evento click al canvas per iniziare la rotazione
	roulette.addEventListener('click', () => {
		//console.log(lines)
		if(lines.length === 0 || (lines[0] === '' && lines.length === 1) || isRotating)
			return;
		startRotation();
	});
})();




