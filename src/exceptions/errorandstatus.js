export class ErrorAndStatus extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
}
