// version-manager.js
// Author: Oscar Collins
// Last Modified: 2025










//0-Set up global variables______________________________________________________________
	let beforeInstallPromptEvent; //variable to store the beforeinstallprompt event for later use
//________________________________________________________________________________________









// 1-Set up bootstrap componants_________________________________________________________ 

	// Safely initialize Bootstrap components (written by AI)----
		function initBootstrapComponent(element, factory, label)
		{
			if(!element)
			{
				console.warn(`${label} skipped: element missing`);
				return null;
			}

			try
			{
				return factory(element);
			}
			catch(error)
			{
				console.error(`Failed to init ${label}:`, error);
				return null;
			}
		}
	//-----------------------------------------------------------




	// Button to manually open the install modal-----------------
		const PWA_DIALOG_MANUAL_BUTTON_EL = document.getElementById("PWA-Install-open-dialog");
		const PWA_DIALOG_MANUAL_BUTTON_BOOT= initBootstrapComponent(
			PWA_DIALOG_MANUAL_BUTTON_EL,
			(el) => new bootstrap.Button(el),
			"bootstrap.Button#PWA-Install-open-dialog"
		);
	//-----------------------------------------------------------
	// Install modal---------------------------------------------
		const PWA_DIALOG_EL = document.getElementById("Install-PWA-Modal");
		const PWA_DIALOG_BOOT = initBootstrapComponent(
			PWA_DIALOG_EL,
			(el) => new bootstrap.Modal(el),
			"bootstrap.Modal#Install-PWA-Modal"
		);
	//-----------------------------------------------------------



	// Install modal close button--------------------------------
		const PWA_DIALOG_CLOSE_EL = document.getElementById("PWA-install-cancel");
		if(PWA_DIALOG_CLOSE_EL && PWA_DIALOG_BOOT)
		{
			PWA_DIALOG_CLOSE_EL.addEventListener('click', () => PWA_DIALOG_BOOT.hide());
		}
	//-----------------------------------------------------------
	// Install modal confirm button------------------------------
		const PWA_DIALOG_CONFIRM_EL = document.getElementById("PWA-install-confirm");
		if(PWA_DIALOG_CONFIRM_EL)
		{
			PWA_DIALOG_CONFIRM_EL.addEventListener("click", installPwa);
		}
	//-----------------------------------------------------------



	// Reload toast----------------------------------------------
		const PWA_TOAST_EL = document.getElementById('PWA-reload-toast');
		const PWA_TOAST_BOOT = initBootstrapComponent(
			PWA_TOAST_EL,
			(el) => new bootstrap.Toast(el, { delay: 10000 }),
			"bootstrap.Toast#PWA-reload-toast"
		);
	//-----------------------------------------------------------
	// Reload toast action button--------------------------------
		const PWA_INTOAST_RELOAD_EL = document.getElementById('PWA-in-toast-reload');
		if(PWA_INTOAST_RELOAD_EL)
		{
			PWA_INTOAST_RELOAD_EL.addEventListener('click', () => reloadPwa());
		}
	//-----------------------------------------------------------
//________________________________________________________________________________________










// 2-Environement check: running as web page or PWA?______________________________________
	function main() { // called on script load
		console.debug("main()");
		if(window.matchMedia("(display-mode: standalone)").matches) {
			console.log("Running as PWA");
			// Disable the manual install button if present
			if(PWA_DIALOG_MANUAL_BUTTON_EL) {
				PWA_DIALOG_MANUAL_BUTTON_EL.disabled = true;
			}
			registerServiceWorker();
		}
		else
		{
			console.log("Running as Web page");
	
			window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);	//listen for the beforeinstallprompt event to know when the PWA can be installed
			window.addEventListener("appinstalled", onAppInstalled);				//listen for the appinstalled event to know when the PWA has been installed
		}
	}
	main();
//________________________________________________________________________________________











// 3-Capture the beforeinstallprompt event___________________________________________________________	
	function onBeforeInstallPrompt(event) { 	//the BROWSER fires this event when the PWA can be installed
		console.debug("onBeforeInstallPrompt()");
	
		event.preventDefault(); 			//prevent the mini info bar showing up
		if(PWA_DIALOG_BOOT)
		{
			PWA_DIALOG_BOOT.show();	//show the install dialog (Bootstrap)
		}
		beforeInstallPromptEvent = event;	//save the event for later use
	}
//________________________________________________________________________________________










// 4-Install the PWA___________________________________________________________	
	async function installPwa()	{	//the USER clicks the install button inside the install dialog
		console.debug("installPwa()");

		// Ensure the saved event exists and actually exposes a prompt() function
		try { 
			if (beforeInstallPromptEvent && typeof beforeInstallPromptEvent.prompt === 'function') {
				const RESULT = await beforeInstallPromptEvent.prompt();	//show the mini info bar and wait for the user to respond
				switch(RESULT && RESULT.outcome) { //check the user response
					case "accepted": console.log("PWA Install accepted"); break;
					case "dismissed": console.log("PWA Install dismissed"); break;
					default: console.log("PWA Install prompt returned:", RESULT); break;
				}

				// clear the saved event once used so future clicks don't try to reuse it
				beforeInstallPromptEvent = null;
			}
			else {
				console.warn("No beforeinstallprompt event available. The app is likely already installed.");
				if (PWA_DIALOG_MANUAL_BUTTON_EL) PWA_DIALOG_MANUAL_BUTTON_EL.classList.add('d-none'); //hide the manual install button if present
			}
		}

		catch (err) {
			console.error("installPwa() failed:", err);
		}

		finally {
			if(PWA_DIALOG_CONFIRM_EL)
			{
				PWA_DIALOG_CONFIRM_EL.disabled = true;		//disable the install button, we don't need it anymore
			}
			window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt); 	//no need to listen for this event anymore
			if(PWA_DIALOG_BOOT)
			{
				PWA_DIALOG_BOOT.hide();	//close the install dialog (Bootstrap)
			}
		}
	}
//________________________________________________________________________________________









// 5-Register the service worker once the PWA is installed_________________________________
	


	// Begin when PWA is installed---------------
		function onAppInstalled() {
			console.debug("onAppInstalled()");
			registerServiceWorker();
		}
	//-------------------------------------------



	// Register service worker------------------
		async function registerServiceWorker() {
			console.debug("registerServiceWorker()");

			// Check if service workers are supported
			if("serviceWorker" in navigator) {	
				console.log("Register Service Worker…");
				
				// If so, register the service worker
				try {
					const REGISTRATION = await navigator.serviceWorker.register("./service_worker.js");
					REGISTRATION.onupdatefound = onUpdateFound; //listen for updates to the service worker
					console.log("Service Worker registration successful with scope:", REGISTRATION.scope);
				}
				catch(error) {
					console.error("Service Worker registration failed:", error);
				}
			}
			else {
				console.warn("Service Worker not supported…");
			}
		}
	//-------------------------------------------



	// Handle service worker updates-------------
	function onUpdateFound(event)	//the browser fires this event when a new version of the service worker file is found on the server
	{
		console.debug("onUpdateFound()");
	
		const REGISTRATION = event.target;	//get the service worker registration object
		const SERVICE_WORKER = REGISTRATION.installing;  //get the new service worker that is being installed
		SERVICE_WORKER.addEventListener("statechange", onStateChange);	//listen for state changes on the new service worker because we want to know when it is installed
	}
	//-------------------------------------------



	// Handle service worker state changes------
		function onStateChange(event) {	//the service worker fires this event when its state changes (installing -> installed -> activating -> activated)
			const SERVICE_WORKER = event.target;	//get the service worker that fired the event
		
			console.debug("onStateChange", SERVICE_WORKER.state);	//log the new state
		
			if(SERVICE_WORKER.state == "installed" && navigator.serviceWorker.controller) { //check if the new service worker is installed and if there is an existing service worker controlling the page
				console.log("PWA Updated");
				if(PWA_INTOAST_RELOAD_EL) {
					PWA_INTOAST_RELOAD_EL.disabled = false;  //enable the reload button
				}
				console.log("showing bootstrap toast reload notification");
				if(PWA_TOAST_BOOT) {
					PWA_TOAST_BOOT.show();
				}
				else {
					console.warn("Reload toast missing; prompting hard reload instead.");
					window.alert("New version installed, please reload.");
				}
			}
		}
	//-------------------------------------------

	// Reload the PWA to apply the new service worker----------
	function reloadPwa() {	//the USER clicks the reload button
		console.debug("reloadPwa()");
		window.location.reload();	//reload the page to activate the new service worker
	}
	//-------------------------------------------
//________________________________________________________________________________________
