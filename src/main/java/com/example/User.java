package com.example;

public class User {
	private String uname;
	private String pass;
	private int highscore = 0;
	private int coins = 0;
	// private int headware=0;
	// private int outfit=0;
	// private int gender=0;
	private String color = "blue";
	private String glasses = "noglasses";
	private int place = 0;
	private String[] unlocked = {};
	private String lastUnlocked = "";

	public String getLastUnlocked() {
		return this.lastUnlocked;
	}

	public void setLastUnlocked(String lastUnlocked) {
		this.lastUnlocked = lastUnlocked;
	}

	public String[] getUnlocked() {
		return this.unlocked;
	}

	public String getUnlockedString() {
		String unlockedString = "{";
		for (int i = 0; i < this.unlocked.length; i++) {
			unlockedString += "\"" + unlocked[i] + "\"";
			if (i != this.unlocked.length - 1) {
				unlockedString += ",";
			}
		}
		unlockedString += "}";
		return unlockedString;
	}

	public void setUnlocked(String[] unlocked) {
		this.unlocked = unlocked;
	}

	public String getUname() {
		return this.uname;
	}

	public void setUname(String uname) {
		this.uname = uname;
	}

	public String getPass() {
		return this.pass;
	}

	public void setPass(String pass) {
		this.pass = pass;
	}

	public int getHighscore() {
		return this.highscore;
	}

	public void setHighscore(int highscore) {
		this.highscore = highscore;
	}

	public int getCoins() {
		return this.coins;
	}

	public void setCoins(int coins) {
		this.coins = coins;
	}

	public String getColor() {
		return this.color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getGlasses() {
		return this.glasses;
	}

	public void setGlasses(String glasses) {
		this.glasses = glasses;
	}

	public int getPlace() {
		return this.place;
	}

	public void setPlace(int place) {
		this.place = place;
	}

}